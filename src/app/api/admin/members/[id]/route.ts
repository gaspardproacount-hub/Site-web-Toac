import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { updateMember, deleteMember, DatabaseNotConfiguredError, type MemberPatch } from "@/lib/db";

const BOOLEAN_FIELDS = [
  "paiement",
  "formulaireAdhesion",
  "caution",
  "groupeGoogle",
  "whatsapp",
  "licenceDemandee",
  "licencePayee",
  "justificatif",
] as const;
const STATUSES = ["new", "membre", "bureau", "arbitre"] as const;

/** Coche/décoche une étape du dossier ou change le statut. Réservé au bureau (admin). */
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
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const patch: MemberPatch = {};
  for (const field of BOOLEAN_FIELDS) {
    if (field in body) {
      if (typeof body[field] !== "boolean") {
        return NextResponse.json({ error: `${field} doit être un booléen.` }, { status: 400 });
      }
      patch[field] = body[field];
    }
  }
  if ("status" in body) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }
    patch.status = body.status;
  }

  try {
    await updateMember(id, patch);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Échec de la mise à jour du dossier adhérent :", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Supprime un dossier adhérent. Réservé au bureau (admin). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { id } = await params;

  try {
    await deleteMember(id);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Échec de la suppression du dossier adhérent :", error);
    return NextResponse.json({ error: "Une erreur est survenue." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
