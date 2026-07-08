import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getMembers, DatabaseNotConfiguredError } from "@/lib/db";

/** Vue bureau : liste complète des dossiers adhérents. Réservé au rôle admin. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  try {
    return NextResponse.json({ members: await getMembers() });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    throw error;
  }
}
