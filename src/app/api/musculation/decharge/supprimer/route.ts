import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { deleteMusculationDecharge, DatabaseNotConfiguredError } from "@/lib/db";
import { deleteBlobs, isLegacyPublicUrl, BlobNotConfiguredError } from "@/lib/blob";

/**
 * Suppression définitive d'un dossier de décharge musculation : la ligne en base
 * et les deux fichiers correspondants dans le store Blob. Réservée aux comptes
 * `admin` (vue bureau).
 *
 * Sert au ménage des dossiers de test comme aux demandes d'effacement des
 * adhérents (RGPD) : rien n'est conservé après l'appel.
 */
export async function POST(request: NextRequest) {
  const session = await getSession().catch(() => null);
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Identifiant de dossier invalide." }, { status: 400 });
  }

  let row;
  try {
    row = await deleteMusculationDecharge(id);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json({ error: "Base de données non configurée côté serveur." }, { status: 503 });
    }
    console.error(`Échec de la suppression du dossier musculation ${id} :`, error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
  }

  // La ligne est supprimée : les fichiers ne sont plus atteignables par le site.
  // Un échec d'effacement du store laisse donc des orphelins, pas une fuite —
  // on le journalise sans renvoyer d'erreur à l'utilisateur.
  const paths = [row.decharge_url, row.certificat_url].filter(
    (p): p is string => typeof p === "string" && p !== "" && !isLegacyPublicUrl(p)
  );
  try {
    await deleteBlobs(paths);
  } catch (error) {
    if (error instanceof BlobNotConfiguredError) {
      console.error(error.message);
    } else {
      console.error(`Dossier ${id} supprimé en base, mais ses fichiers subsistent dans le store :`, error);
    }
  }

  return NextResponse.json({ ok: true });
}
