import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { setPartnerSignupStatut, DatabaseNotConfiguredError } from "@/lib/db";

const STATUSES = ["nouveau", "traite"] as const;

/** Marque une demande d'avantage partenaire traitée (ou la rouvre). Réservé au bureau (admin). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const statut = body?.statut;
  if (!STATUSES.includes(statut)) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  try {
    await setPartnerSignupStatut(Number(id), statut);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Échec de la mise à jour de la demande partenaire :", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
