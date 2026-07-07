import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

/** Statut de connexion minimal, sans donnée sensible, pour piloter l'UI (Navbar). */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ loggedIn: false });
  }
  return NextResponse.json({
    loggedIn: true,
    name: session.name,
    role: session.role,
  });
}
