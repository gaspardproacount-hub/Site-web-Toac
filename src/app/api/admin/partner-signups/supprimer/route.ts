import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { deletePartnerSignup, getPartnerSignupById, DatabaseNotConfiguredError } from "@/lib/db";

/**
 * Suppression définitive d'une demande d'activation partenaire. Réservée
 * aux comptes `admin` (vue bureau).
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

  try {
    const existing = await getPartnerSignupById(id);
    if (!existing) {
      return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
    }
    await deletePartnerSignup(id);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json({ error: "Base de données non configurée côté serveur." }, { status: 503 });
    }
    console.error(`Échec de la suppression de la demande partenaire ${id} :`, error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
