import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Verrou optionnel pour tout le site (utile tant qu'il n'est pas prêt à être
 * montré publiquement) : si SITE_PASSWORD est définie, le navigateur demande
 * un identifiant/mot de passe (authentification HTTP basique) avant
 * d'afficher n'importe quelle page. Laissez SITE_PASSWORD vide pour un site
 * public normal (comportement par défaut).
 *
 * Exclu de ce verrou : la notification de paiement Monetico
 * (/api/monetico/retour), qui doit rester joignable par les serveurs
 * Monetico sans authentification navigateur.
 */
const SITE_LOCK_EXCLUDED_PATHS = ["/api/monetico/retour"];

function checkSiteLock(request: NextRequest): NextResponse | null {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  if (SITE_LOCK_EXCLUDED_PATHS.some((p) => request.nextUrl.pathname.startsWith(p))) {
    return null;
  }

  const expected = `Basic ${Buffer.from(`toac:${password}`).toString("base64")}`;
  if (request.headers.get("authorization") === expected) return null;

  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="TOAC Triathlon"' },
  });
}

/**
 * Protège l'espace adhérents côté serveur : toute tentative d'accès direct
 * par URL sans session valide est redirigée vers la connexion, quelle que
 * soit la page demandée (protection au niveau du proxy, pas seulement
 * visuelle côté client).
 */
export function proxy(request: NextRequest) {
  const lockResponse = checkSiteLock(request);
  if (lockResponse) return lockResponse;

  if (!request.nextUrl.pathname.startsWith("/espace-adherents")) {
    return NextResponse.next();
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
