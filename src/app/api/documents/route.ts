import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getMusculationDechargeByToken, DatabaseNotConfiguredError } from "@/lib/db";
import { getBlobStream, isLegacyPublicUrl, BlobNotConfiguredError } from "@/lib/blob";

/**
 * Sert les documents déposés sur le store Blob privé (décharges musculation,
 * certificats médicaux, justificatifs de tarif réduit). Ces fichiers n'ont pas
 * d'URL publique : ils ne sortent que par ici, après contrôle d'accès.
 *
 * Deux façons d'y avoir droit :
 *  - être connecté avec un compte `admin` (vue bureau) ;
 *  - fournir le `token` d'un dossier de décharge musculation, et ne demander
 *    qu'un des deux fichiers de CE dossier. Ce jeton aléatoire est déjà la clé
 *    de la page de relecture (/musculation/valider/<token>) : l'adhérent peut
 *    relire ses propres documents sans compte, et personne d'autre.
 */

export const maxDuration = 30;

/** Préfixes de chemins que la route accepte de servir, même pour un admin. */
const ALLOWED_PREFIXES = ["musculation/", "justificatifs/"];

/** Types servis tels quels dans le navigateur ; tout le reste part en téléchargement. */
const INLINE_CONTENT_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/jpg"]);

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path")?.trim() ?? "";
  const token = request.nextUrl.searchParams.get("token")?.trim() ?? "";

  if (!path) {
    return NextResponse.json({ error: "Paramètre `path` manquant." }, { status: 400 });
  }

  // Les enregistrements d'avant le passage au store privé stockent une URL
  // publique complète : on redirige vers elle plutôt que de la chercher dans le
  // store privé, où elle n'existe pas.
  if (isLegacyPublicUrl(path)) {
    const session = await getSession().catch(() => null);
    if (session?.role !== "admin") {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }
    return NextResponse.redirect(path);
  }

  if (path.includes("..") || !ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.json({ error: "Chemin de document non autorisé." }, { status: 403 });
  }

  const session = await getSession().catch(() => null);
  let authorized = session?.role === "admin";

  if (!authorized && token) {
    try {
      const decharge = await getMusculationDechargeByToken(token);
      // Le jeton n'ouvre que les deux fichiers de son propre dossier.
      authorized =
        decharge !== null && (decharge.decharge_url === path || decharge.certificat_url === path);
    } catch (error) {
      if (!(error instanceof DatabaseNotConfiguredError)) throw error;
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  let result;
  try {
    result = await getBlobStream(path, {
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });
  } catch (error) {
    if (error instanceof BlobNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json({ error: "Stockage des documents non configuré." }, { status: 503 });
    }
    console.error(`Échec de la lecture du document ${path} :`, error);
    return NextResponse.json({ error: "Document momentanément indisponible." }, { status: 502 });
  }

  if (!result) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  const baseHeaders = {
    ETag: result.blob.etag,
    "Cache-Control": "private, no-cache, no-store",
    "X-Content-Type-Options": "nosniff",
  };

  if (result.statusCode === 304) {
    return new NextResponse(null, { status: 304, headers: baseHeaders });
  }

  const contentType = result.blob.contentType;
  // `?dl=1` force le téléchargement plutôt que l'affichage — utilisé par le
  // bouton « Télécharger le document » des emails envoyés au bureau.
  const forceDownload = request.nextUrl.searchParams.get("dl") === "1";
  const inline = !forceDownload && INLINE_CONTENT_TYPES.has(contentType);
  const filename = path.split("/").pop() || "document";

  return new NextResponse(result.stream, {
    headers: {
      ...baseHeaders,
      "Content-Type": inline ? contentType : "application/octet-stream",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
    },
  });
}
