import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateMusculationDecharge, DatabaseNotConfiguredError } from "@/lib/db";
import { sendMusculationNotification } from "@/lib/musculationNotification";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = String(body?.token ?? "");

  if (!token) {
    return NextResponse.json({ error: "Lien de validation invalide." }, { status: 400 });
  }

  let row;
  try {
    row = await validateMusculationDecharge(token);
    if (!row) {
      return NextResponse.json({ error: "Lien de validation introuvable ou expiré." }, { status: 404 });
    }
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json({ error: "Base de données non configurée côté serveur." }, { status: 503 });
    }
    console.error("Échec de la validation de la décharge musculation :", error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }

  // Le dossier est validé à partir d'ici : un échec d'envoi de la notification
  // ne doit pas être présenté à l'adhérent comme un échec de sa démarche. Il est
  // journalisé, et le dossier reste visible dans la vue bureau.
  try {
    await sendMusculationNotification({
      origin: request.nextUrl.origin,
      documentPath: row.decharge_url,
      token: row.token,
    });
  } catch (error) {
    console.error("Échec de l'envoi de la notification musculation :", error);
  }

  return NextResponse.json({ ok: true });
}
