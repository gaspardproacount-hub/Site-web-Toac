import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Protège l'espace adhérents côté serveur : toute tentative d'accès direct
 * par URL sans session valide est redirigée vers la connexion, quelle que
 * soit la page demandée (protection au niveau du proxy, pas seulement
 * visuelle côté client).
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    request.nextUrl.pathname.startsWith("/espace-adherents/bureau") &&
    session.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/espace-adherents/dossier", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/espace-adherents/:path*"],
};
