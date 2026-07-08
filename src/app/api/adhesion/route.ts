import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { insertInscription, DatabaseNotConfiguredError } from "@/lib/db";

/**
 * Formulaire d'adhésion en ligne (remplace le Google Form externe) :
 * enregistre chaque demande dans la base de données du club (table
 * `inscriptions`, voir src/lib/db.ts), consultable dans la vue bureau
 * (Espace Adhérents → Bureau → Inscriptions).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const {
    prenom,
    nom,
    dateNaissance,
    email,
    telephone,
    adresse,
    formule,
    licenceExistante,
    contactUrgenceNom,
    contactUrgenceTelephone,
    certificatMedical,
    droitImage,
    message,
  } = body;

  if (!prenom || !nom || !email) {
    return NextResponse.json(
      { error: "Prénom, nom et email sont requis." },
      { status: 400 }
    );
  }

  try {
    await insertInscription({
      prenom: String(prenom),
      nom: String(nom),
      dateNaissance: String(dateNaissance ?? ""),
      email: String(email),
      telephone: String(telephone ?? ""),
      adresse: String(adresse ?? ""),
      formule: String(formule ?? ""),
      licenceExistante: String(licenceExistante ?? ""),
      contactUrgenceNom: String(contactUrgenceNom ?? ""),
      contactUrgenceTelephone: String(contactUrgenceTelephone ?? ""),
      certificatMedical: String(certificatMedical ?? ""),
      droitImage: Boolean(droitImage),
      message: String(message ?? ""),
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
    console.error("Échec de l'enregistrement de l'inscription :", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessayez plus tard." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
