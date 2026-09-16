import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPartnerSignupByToken, markPartnerSignupAdded, DatabaseNotConfiguredError } from "@/lib/db";
import { notifyMember } from "@/lib/partnerSignupNotify";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = String(body?.token ?? "");

  if (!token) {
    return NextResponse.json({ error: "Lien de confirmation invalide." }, { status: 400 });
  }

  let existing;
  try {
    existing = await getPartnerSignupByToken(token);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json({ error: "Base de données non configurée côté serveur." }, { status: 503 });
    }
    console.error("Échec de la lecture de la demande partenaire :", error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Lien de confirmation introuvable." }, { status: 404 });
  }
  if (existing.statut === "ajoute") {
    // Déjà confirmée (double clic, ou lien rouvert) : pas une erreur, on ne
    // renvoie juste pas une seconde fois l'email à l'adhérent.
    return NextResponse.json({ ok: true, alreadyDone: true });
  }

  let updated;
  try {
    updated = await markPartnerSignupAdded(existing.id);
  } catch (error) {
    console.error("Échec de la confirmation de la demande partenaire :", error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json({ ok: true, alreadyDone: true });
  }

  // La demande est confirmée à partir d'ici : un échec d'envoi à l'adhérent
  // ne doit pas être présenté comme un échec de la confirmation elle-même.
  await notifyMember(updated);

  return NextResponse.json({ ok: true, alreadyDone: false });
}
