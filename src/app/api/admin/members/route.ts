import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getMembers } from "@/lib/data-store";

/** Vue bureau : liste complète des dossiers adhérents. Réservé au rôle admin. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  return NextResponse.json({ members: getMembers() });
}
