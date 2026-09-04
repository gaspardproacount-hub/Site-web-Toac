import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateMusculationDecharge, DatabaseNotConfiguredError } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = String(body?.token ?? "");

  if (!token) {
    return NextResponse.json({ error: "Lien de validation invalide." }, { status: 400 });
  }

  try {
    const row = await validateMusculationDecharge(token);
    if (!row) {
      return NextResponse.json({ error: "Lien de validation introuvable ou expiré." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return NextResponse.json({ error: "Base de données non configurée côté serveur." }, { status: 503 });
    }
    console.error("Échec de la validation de la décharge musculation :", error);
    return NextResponse.json({ error: "Une erreur est survenue. Réessayez plus tard." }, { status: 500 });
  }
}
