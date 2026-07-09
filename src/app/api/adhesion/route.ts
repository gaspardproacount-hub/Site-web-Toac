import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { put, BlobError } from "@vercel/blob";
import { insertInscription, DatabaseNotConfiguredError } from "@/lib/db";
import { buildPaymentForm, buildAutoSubmitHtml, buildErrorHtml } from "@/lib/monetico";
import {
  ADHESION_CLUB_TARIFS,
  LICENCE_FFTRI_TARIFS,
  ASSURANCE_TARIFS,
  CAUTION_CENTIMES,
  type LicenceType,
} from "@/content/tarifs";

/**
 * Formulaire d'adhésion en ligne, unique : inscription + paiement (cotisation
 * + caution de 100€ obligatoire) en une seule étape. Un simple envoi du
 * formulaire n'enregistre qu'une demande (table `inscriptions`) — la
 * personne n'est PAS considérée comme adhérente et n'apparaît pas dans
 * Bureau → Dossiers adhérents tant que le paiement n'est pas confirmé par
 * Monetico (voir /api/monetico/retour, qui appelle markInscriptionPaid et
 * ne crée le dossier adhérent qu'à ce moment-là).
 *
 * Laisse le temps à une base Neon en veille de se réveiller (sinon Vercel
 * coupe la fonction après 10s par défaut sur le plan Hobby).
 */
export const maxDuration = 30;

function htmlError(message: string) {
  return new NextResponse(buildErrorHtml(message, "/nous-rejoindre"), {
    status: 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();

  const prenom = String(form.get("prenom") ?? "").trim();
  const nom = String(form.get("nom") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const dateNaissance = String(form.get("dateNaissance") ?? "");
  const telephone = String(form.get("telephone") ?? "");
  const adresse = String(form.get("adresse") ?? "");
  const licenceExistante = String(form.get("licenceExistante") ?? "");
  const contactUrgenceNom = String(form.get("contactUrgenceNom") ?? "");
  const contactUrgenceTelephone = String(form.get("contactUrgenceTelephone") ?? "");
  const certificatMedical = String(form.get("certificatMedical") ?? "");
  const droitImage = form.get("droitImage") === "on";
  const message = String(form.get("message") ?? "");
  const tarifReduitDemande = form.get("tarifReduit") === "oui";
  const licenceType: LicenceType = form.get("licenceType") === "competition" ? "competition" : "loisir";
  const justificatifFile = form.get("justificatif");
  const assurance = ASSURANCE_TARIFS.find((a) => a.id === form.get("assurance"));

  if (!prenom || !nom || !email) {
    return htmlError("Prénom, nom et email sont requis.");
  }
  if (!assurance) {
    return htmlError("Merci de choisir une formule d'assurance FFTRI.");
  }
  if (tarifReduitDemande && !(justificatifFile instanceof File && justificatifFile.size > 0)) {
    return htmlError(
      "Merci de joindre un justificatif (Airbus Opérations, ayant droit Airbus Opérations, chômeur ou étudiant) pour bénéficier du tarif réduit."
    );
  }

  let justificatifUrl: string | null = null;
  if (justificatifFile instanceof File && justificatifFile.size > 0) {
    try {
      const blob = await put(`justificatifs/${Date.now()}-${justificatifFile.name}`, justificatifFile, {
        access: "public",
      });
      justificatifUrl = blob.url;
    } catch (error) {
      if (error instanceof BlobError) {
        console.warn(
          "Justificatif non stocké : Vercel Blob n'est pas configuré (voir .env.example / README)."
        );
      } else {
        console.error("Échec de l'upload du justificatif :", error);
      }
    }
  }

  let inscriptionId: number;
  try {
    inscriptionId = await insertInscription({
      prenom,
      nom,
      dateNaissance,
      email,
      telephone,
      adresse,
      formule: `${tarifReduitDemande ? "reduit" : "plein"}-${licenceType}`,
      licenceExistante,
      contactUrgenceNom,
      contactUrgenceTelephone,
      certificatMedical,
      droitImage,
      message,
      justificatifUrl,
      assurance: assurance.label,
    });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return htmlError(
        "Le formulaire n'est pas encore relié à une base de données côté serveur. Contactez le bureau directement en attendant."
      );
    }
    console.error("Échec de l'enregistrement de l'inscription :", error);
    return htmlError("Une erreur est survenue. Réessayez plus tard.");
  }

  const adhesionClub = ADHESION_CLUB_TARIFS[tarifReduitDemande ? "reduit" : "plein"];
  const licenceFFTri = LICENCE_FFTRI_TARIFS[licenceType];
  const montantCentimes =
    adhesionClub.montantCentimes + licenceFFTri.montantCentimes + assurance.montantCentimes + CAUTION_CENTIMES;
  const reference = `TOAC-I${inscriptionId}-${Date.now()}`;

  let payment: ReturnType<typeof buildPaymentForm>;
  try {
    payment = buildPaymentForm({
      montantCentimes,
      reference,
      email,
      texteLibre: `${adhesionClub.label} + ${licenceFFTri.label} + ${assurance.label} + Caution bénévolat (Toac)`,
    });
  } catch (error) {
    console.error("Configuration Monetico manquante :", error);
    return htmlError(
      "Le paiement en ligne n'est pas encore configuré côté serveur. Contactez le bureau directement en attendant."
    );
  }

  return new NextResponse(buildAutoSubmitHtml(payment), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
