import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Appelée par le dashboard Devanture après chaque modification, pour que le
 * site public reflète le changement immédiatement au lieu d'attendre la
 * fenêtre de cache ISR (jusqu'à 60s, parfois un rechargement de plus).
 * Nécessite REVALIDATE_SECRET (même valeur que côté dashboard) — sans cette
 * variable d'environnement, le site continue de fonctionner normalement, il
 * se met juste à jour avec un peu de délai via le cache habituel.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true });
}
