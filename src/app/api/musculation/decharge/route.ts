import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateDechargePdf } from "@/lib/musculationDecharge";
import { uploadFileToMusculationFolder, GoogleDriveNotConfiguredError } from "@/lib/googleDrive";
import { slugify } from "@/lib/slug";

// Laisse le temps à l'upload des documents + à l'appel Google Drive de se
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
  const estMineur = form.get("estMineur") === "on";
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
      signatureFile.type
    );
  } catch (error) {
    console.error("Échec de la génération du PDF de décharge :", error);
    return NextResponse.json(
      { error: "Échec de la génération du document de décharge. Réessayez plus tard." },
      { status: 500 }
    );
  }

  const baseName = `${slugify(nom)}-${slugify(prenom)}`;
  const dechargeFilename = `${baseName}-decharge.pdf`;
  const certificatFilename = `${baseName}-certif.${extensionForMime(certificatFile.type)}`;

  try {
    const [dechargeLink, certificatLink] = await Promise.all([
      uploadFileToMusculationFolder(dechargeFilename, "application/pdf", dechargePdf),
      uploadFileToMusculationFolder(certificatFilename, certificatFile.type, certificatBytes),
    ]);
    return NextResponse.json({ ok: true, dechargeLink, certificatLink });
  } catch (error) {
    if (error instanceof GoogleDriveNotConfiguredError) {
      console.warn(error.message);
      return NextResponse.json(
        {
          error:
            "Le dépôt automatique sur Google Drive n'est pas encore configuré côté serveur. Contactez le bureau pour transmettre vos documents en attendant.",
        },
        { status: 503 }
      );
    }
    console.error("Échec du dépôt des documents musculation sur Google Drive :", error);
    return NextResponse.json(
      { error: "Échec de l'envoi des documents. Réessayez plus tard." },
      { status: 502 }
    );
  }
}
