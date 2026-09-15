import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getMusculationDechargeById, DatabaseNotConfiguredError } from "@/lib/db";
import { notifyAndRecord } from "@/lib/musculationNotify";

/**
 * Renvoie au bureau la notification d'un dossier déjà validé, depuis la vue
 * bureau. Utile quand le premier envoi a échoué, ou après avoir corrigé la
 * liste des destinataires.
 *
 * Réservée aux comptes `admin` : elle déclenche un envoi d'emails.
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
    return NextResponse.json({ error: "Identifiant de dossier invalide." }, { status: 400 });
  }

  let decharge;
  try {
    decharge = await getMusculationDechargeById(id);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json({ error: "Base de données non configurée côté serveur." }, { status: 503 });
    }
    console.error(`Échec de la lecture du dossier musculation ${id} :`, error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  if (!decharge) {
    return NextResponse.json({ error: "Dossier introuvable." }, { status: 404 });
  }
  if (decharge.statut !== "valide") {
    return NextResponse.json(
      { error: "Ce dossier n'a pas encore été validé par l'adhérent : rien à transmettre." },
      { status: 409 }
    );
  }

  const outcome = await notifyAndRecord(decharge, request.nextUrl.origin);

  if (outcome.statut !== "envoyee") {
    return NextResponse.json(
      { error: outcome.erreur ?? "L'envoi a échoué.", statut: outcome.statut },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, destinataires: outcome.destinataires });
}
