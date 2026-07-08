import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyReturnSeal } from "@/lib/monetico";
import { upsertCommande, DatabaseNotConfiguredError } from "@/lib/db";

/** Extrait le montant en centimes depuis un champ Monetico du type "25.00EUR". */
function parseMontant(montant: string | undefined): { centimes: number | null; devise: string | null } {
  if (!montant) return { centimes: null, devise: null };
  const match = /^([\d.]+)([A-Z]{3})$/.exec(montant);
  if (!match) return { centimes: null, devise: null };
  return { centimes: Math.round(Number(match[1]) * 100), devise: match[2] };
}

/**
 * CGI de retour Monetico : reçoit la notification de paiement (POST),
 * vérifie le sceau MAC, enregistre automatiquement la commande dans la base
 * de données du club (table `commandes`, voir src/lib/db.ts — remplace le
 * fichier Excel envoyé par email), puis répond "version=2\ncdr=0" (accusé de
 * réception attendu par Monetico).
 */
// Laisse le temps à une base Neon en veille de se réveiller (sinon Vercel
// coupe la fonction après 10s par défaut sur le plan Hobby).
export const maxDuration = 30;
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const fields: Record<string, string> = {};
  form.forEach((value, key) => {
    if (key !== "MAC") fields[key] = String(value);
  });
  const mac = String(form.get("MAC") ?? "");

  let valid = false;
  try {
    valid = verifyReturnSeal(fields, mac);
  } catch (error) {
    console.error("Configuration Monetico manquante:", error);
    return new NextResponse("panne", { status: 500 });
  }

  if (!valid) {
    console.warn("Sceau Monetico invalide", fields);
    return new NextResponse("panne", { status: 400 });
  }

  console.info("Paiement Monetico reçu", {
    reference: fields.reference,
    montant: fields.montant,
    codeRetour: fields["code-retour"],
  });

  const { centimes, devise } = parseMontant(fields.montant);

  try {
    await upsertCommande({
      reference: fields.reference ?? `inconnue-${Date.now()}`,
      datePaiement: fields.date ?? null,
      email: fields.mail ?? null,
      montantCentimes: centimes,
      devise,
      // cvx = "oui" signifie paiement accepté (convention Monetico).
      statut: fields.cvx === "oui" ? "payé" : "refusé",
      codeRetour: fields["code-retour"] ?? null,
      marqueCarte: fields.brand ?? null,
      numeroAutorisation: fields.numauto ?? null,
      texteLibre: fields["texte-libre"] ?? null,
      brut: fields,
    });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.warn(
        "Commande Monetico reçue mais non enregistrée : base de données non configurée (voir .env.example)."
      );
    } else {
      console.error("Échec de l'enregistrement de la commande Monetico en base :", error);
    }
    // On accuse quand même réception à Monetico : ce n'est pas au client de
    // subir une panne de notre base de données.
  }

  return new NextResponse("version=2\ncdr=0", {
    headers: { "content-type": "text/plain" },
  });
}
