import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyReturnSeal } from "@/lib/monetico";

/**
 * CGI de retour Monetico : reçoit la notification de paiement (POST),
 * vérifie le sceau MAC, puis répond "payment=ok" (attendu par Monetico
 * pour accuser réception) et journalise le résultat.
 *
 * TODO club : brancher ici l'enregistrement du statut de paiement dans le
 * dossier de l'adhérent concerné (src/lib/data-store.ts) une fois le CSV
 * des adhérents importé et le lien référence <-> adhérent défini.
 */
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

  return new NextResponse("version=2\ncdr=0", {
    headers: { "content-type": "text/plain" },
  });
}
