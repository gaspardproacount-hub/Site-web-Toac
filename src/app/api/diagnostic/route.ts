import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { collectDiagnostic, runBlobTest } from "@/lib/diagnostic";

/**
 * Diagnostic serveur en JSON, accessible SANS compte adhérent — la page
 * équivalente (/espace-adherents/bureau/diagnostic) est derrière la connexion
 * bureau, inutilisable tant que l'espace adhérents n'est pas ouvert.
 *
 * Accès : `?key=<valeur de DIAGNOSTIC_KEY>`, ou une session `admin`. Aucune clé
 * n'est inscrite dans le code : le dépôt est public, elle n'y serait pas
 * secrète. Définissez DIAGNOSTIC_KEY dans les variables d'environnement du
 * projet (n'importe quelle chaîne aléatoire), puis redéployez.
 *
 * La réponse d'échec indique si DIAGNOSTIC_KEY est arrivée jusqu'à la fonction :
 * c'est en soi le premier test, celui qui dit si les variables du projet sont
 * injectées au runtime ou pas du tout.
 *
 * Route de dépannage temporaire : à supprimer une fois le stockage réparé.
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const expected = process.env.DIAGNOSTIC_KEY?.trim();
  const provided = request.nextUrl.searchParams.get("key")?.trim() ?? "";
  const authorized = Boolean(expected) && provided === expected;

  if (!authorized) {
    // Un compte admin connecté reste un accès valide, sans clé.
    const session = await getSession().catch(() => null);
    if (session?.role !== "admin") {
      return NextResponse.json(
        {
          error: expected
            ? "Clé de diagnostic invalide."
            : "DIAGNOSTIC_KEY n'est pas définie côté serveur : ajoutez-la dans les variables d'environnement du projet et redéployez.",
          // Seule information renvoyée sans clé, et la plus utile : la variable
          // arrive-t-elle jusqu'ici, et sur quelle plateforme tourne-t-on ?
          diagnosticKeyPresent: Boolean(expected),
          platform: process.env.VERCEL ? "Vercel" : process.env.NETLIFY ? "Netlify" : "inconnue",
        },
        { status: 403, headers: { "cache-control": "no-store" } }
      );
    }
  }

  const blobTest = request.nextUrl.searchParams.get("test") === "blob" ? await runBlobTest() : null;

  return NextResponse.json(
    { generatedAt: new Date().toISOString(), ...collectDiagnostic(), blobTest },
    { headers: { "cache-control": "no-store" } }
  );
}
