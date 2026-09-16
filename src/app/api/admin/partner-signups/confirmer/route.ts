import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getPartnerSignupById, markPartnerSignupAdded, DatabaseNotConfiguredError } from "@/lib/db";
import { notifyMember } from "@/lib/partnerSignupNotify";

/**
 * Confirme "ajouté côté partenaire" depuis la vue bureau (équivalent du lien
 * de confirmation envoyé par email, pour un bureau qui préfère agir
 * directement dans le dashboard). Réservée aux comptes `admin`.
 */
export async function POST(request: NextRequest) {
  const session = await getSession().catch(() => null);
  if (session?.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const id = Number(body?.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Identifiant de demande invalide." }, { status: 400 });
  }

  let existing;
  try {
    existing = await getPartnerSignupById(id);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json({ error: "Base de données non configurée côté serveur." }, { status: 503 });
    }
    console.error(`Échec de la lecture de la demande partenaire ${id} :`, error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  }
  if (existing.statut === "ajoute") {
    return NextResponse.json({ ok: true, alreadyDone: true });
  }

  let updated;
  try {
    updated = await markPartnerSignupAdded(id);
  } catch (error) {
    console.error(`Échec de la confirmation de la demande partenaire ${id} :`, error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  if (!updated) {
    return NextResponse.json({ ok: true, alreadyDone: true });
  }

  await notifyMember(updated);

  return NextResponse.json({ ok: true, alreadyDone: false });
}
