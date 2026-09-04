import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "node:crypto";
import { putBlob, BlobNotConfiguredError } from "@/lib/blob";
import { generateDechargePdf } from "@/lib/musculationDecharge";
import { isMineur } from "@/lib/age";
import { insertMusculationDecharge, DatabaseNotConfiguredError } from "@/lib/db";
import { slugify } from "@/lib/slug";

// Laisse le temps à l'upload des fichiers + à la génération du PDF de se
// terminer (au-delà du timeout par défaut de 10s sur le plan Hobby Vercel).
export const maxDuration = 30;

const SIGNATURE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);
const CERTIFICAT_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "application/pdf"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo

function extensionForMime(mimeType: string): string {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png") return "png";
  return "jpg";
}

export async function POST(request: NextRequest) {
  const form = await request.formData();

  const nom = String(form.get("nom") ?? "").trim();
  const prenom = String(form.get("prenom") ?? "").trim();
  const nationalite = String(form.get("nationalite") ?? "").trim();
  const dateNaissance = String(form.get("dateNaissance") ?? "").trim();
  const adresse = String(form.get("adresse") ?? "").trim();
  const codePostal = String(form.get("codePostal") ?? "").trim();
  const ville = String(form.get("ville") ?? "").trim();
  const dateSignature = String(form.get("dateSignature") ?? "").trim();
  const rgpdConsent = form.get("rgpdConsent") === "on";
  // La minorité est déduite de la date de naissance, jamais de ce que déclare
  // le navigateur : c'est elle qui décide si l'autorisation parentale est exigée.
  const estMineur = isMineur(dateNaissance);
  const representantNom = String(form.get("representantNom") ?? "").trim();
  const dateSignatureRepresentant = String(form.get("dateSignatureRepresentant") ?? "").trim();

  const certificatFile = form.get("certificatMedical");
  const signatureFile = form.get("signature");

  if (
    !nom ||
    !prenom ||
    !nationalite ||
    !dateNaissance ||
    !adresse ||
    !codePostal ||
    !ville ||
    !dateSignature
  ) {
    return NextResponse.json({ error: "Merci de renseigner tous les champs de la décharge." }, { status: 400 });
  }

  if (!rgpdConsent) {
    return NextResponse.json(
      { error: "Le consentement au traitement des données (RGPD) est requis." },
      { status: 400 }
    );
  }

  if (estMineur && (!representantNom || !dateSignatureRepresentant)) {
    return NextResponse.json(
      { error: "Pour un(e) adhérent(e) mineur(e), le nom du représentant légal et la date de signature sont requis." },
      { status: 400 }
    );
  }

  if (!(certificatFile instanceof File) || certificatFile.size === 0) {
    return NextResponse.json({ error: "Merci de joindre votre certificat médical (image ou PDF)." }, { status: 400 });
  }
  if (!(signatureFile instanceof File) || signatureFile.size === 0) {
    return NextResponse.json({ error: "Merci de joindre une image de votre signature." }, { status: 400 });
  }
  if (!CERTIFICAT_MIME_TYPES.has(certificatFile.type)) {
    return NextResponse.json(
      { error: "Le certificat médical doit être une image (JPG, PNG) ou un PDF." },
      { status: 400 }
    );
  }
  if (!SIGNATURE_MIME_TYPES.has(signatureFile.type)) {
    return NextResponse.json({ error: "La signature doit être une image JPG ou PNG." }, { status: 400 });
  }
  if (certificatFile.size > MAX_FILE_SIZE_BYTES || signatureFile.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "Chaque fichier doit faire moins de 10 Mo." }, { status: 400 });
  }

  const signatureBytes = Buffer.from(await signatureFile.arrayBuffer());
  const certificatBytes = Buffer.from(await certificatFile.arrayBuffer());

  let dechargePdf: Buffer;
  try {
    dechargePdf = await generateDechargePdf(
      {
        nom,
        prenom,
        nationalite,
        dateNaissance,
        adresse,
        codePostal,
        ville,
        dateSignature,
        mineur: estMineur ? { representantNom, dateSignature: dateSignatureRepresentant } : undefined,
      },
      signatureBytes,
      signatureFile.type,
      // Le certificat est repris dans le même PDF : l'adhérent relit, le bureau
      // reçoit et archive un document unique (décharge puis certificat).
      { bytes: certificatBytes, mimeType: certificatFile.type }
    );
  } catch (error) {
    console.error("Échec de la génération du PDF de décharge :", error);
    return NextResponse.json(
      { error: "Échec de la génération du document de décharge. Réessayez plus tard." },
      { status: 500 }
    );
  }

  const baseName = `${slugify(nom)}-${slugify(prenom)}`;
  const dechargeFilename = `musculation/${baseName}-decharge-${Date.now()}.pdf`;
  const certificatFilename = `musculation/${baseName}-certif-${Date.now()}.${extensionForMime(certificatFile.type)}`;

  // Le store Blob est privé : ces fichiers n'ont pas d'URL publique. On
  // conserve leur chemin dans le store (colonnes `decharge_url` /
  // `certificat_url`, nommées ainsi avant le passage au privé), et ils ne sont
  // relus qu'à travers /api/documents, après contrôle d'accès.
  let dechargePath: string;
  let certificatPath: string;
  try {
    const [dechargeBlob, certificatBlob] = await Promise.all([
      putBlob(dechargeFilename, dechargePdf, { contentType: "application/pdf" }),
      putBlob(certificatFilename, certificatBytes, { contentType: certificatFile.type }),
    ]);
    dechargePath = dechargeBlob.pathname;
    certificatPath = certificatBlob.pathname;
  } catch (error) {
    // Seul le jeton manquant est un défaut de configuration : toute autre
    // erreur Blob (jeton invalide, store suspendu, réseau…) est une panne
    // d'upload, et on la journalise telle quelle pour pouvoir la diagnostiquer
    // depuis les logs Vercel (voir /espace-adherents/bureau/diagnostic).
    if (error instanceof BlobNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json(
        {
          error:
            "Le stockage des documents n'est pas encore configuré côté serveur. Contactez le bureau pour transmettre vos documents en attendant.",
        },
        { status: 503 }
      );
    }
    console.error("Échec de l'upload des documents musculation :", error);
    return NextResponse.json({ error: "Échec de l'envoi des documents. Réessayez plus tard." }, { status: 502 });
  }

  const token = crypto.randomUUID();
  try {
    await insertMusculationDecharge({
      token,
      nom,
      prenom,
      nationalite,
      dateNaissance,
      adresse,
      codePostal,
      ville,
      dateSignature,
      estMineur,
      representantNom: estMineur ? representantNom : null,
      dateSignatureRepresentant: estMineur ? dateSignatureRepresentant : null,
      dechargeUrl: dechargePath,
      certificatUrl: certificatPath,
    });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json(
        {
          error:
            "Le formulaire n'est pas encore relié à une base de données côté serveur. Contactez le bureau directement en attendant.",
        },
        { status: 503 }
      );
    }
    console.error("Échec de l'enregistrement de la décharge musculation :", error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reviewUrl: `/musculation/valider/${token}` });
}
