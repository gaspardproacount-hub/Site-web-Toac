import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getPartnerSignupById, DatabaseNotConfiguredError } from "@/lib/db";
import { notifyStaffAndRecord } from "@/lib/partnerSignupNotify";

/**
 * Renvoie au responsable partenariat la notification d'une demande, depuis
 * la vue bureau. Utile après un échec d'envoi, ou une fois les destinataires
 * corrigés. Réservée aux comptes `admin` : elle déclenche un envoi d'emails.
 */
export const maxDuration = 30;

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

  let signup;
  try {
    signup = await getPartnerSignupById(id);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json({ error: "Base de données non configurée côté serveur." }, { status: 503 });
    }
    console.error(`Échec de la lecture de la demande partenaire ${id} :`, error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  if (!signup) {
    return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  }

  const outcome = await notifyStaffAndRecord(signup, request.nextUrl.origin);

  if (outcome.statut !== "envoyee") {
    return NextResponse.json(
      { error: outcome.erreur ?? "L'envoi a échoué.", statut: outcome.statut },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, destinataires: outcome.destinataires });
}
