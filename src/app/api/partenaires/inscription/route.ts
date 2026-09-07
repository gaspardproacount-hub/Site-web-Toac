import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { insertPartnerSignup, DatabaseNotConfiguredError } from "@/lib/db";
import { buildErrorHtml } from "@/lib/monetico";

/**
 * Demande d'activation des avantages d'un partenaire (ex. Alltricks) : un
 * adhérent indique son identité + l'email de son compte partenaire, à
 * rattacher manuellement par le bureau — voir Bureau → Partenaires.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();

  const partenaire = String(form.get("partenaire") ?? "").trim();
  const nom = String(form.get("nom") ?? "").trim();
  const prenom = String(form.get("prenom") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const consentement = form.get("consentement") === "on";
  const backHref = partenaire ? `/le-club/partenaires/${partenaire}` : "/le-club/partenaires";

  function htmlError(message: string) {
    return new NextResponse(buildErrorHtml(message, backHref), {
      status: 400,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (!partenaire || !nom || !prenom || !email) {
    return htmlError("Merci de renseigner votre nom, prénom et email.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return htmlError("Merci de renseigner une adresse email valide.");
  }
  if (!consentement) {
    return htmlError("Merci de donner votre consentement pour continuer.");
  }

  try {
    await insertPartnerSignup({ partenaire, nom, prenom, email, consentement });
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      console.error(error.message);
      return htmlError(
        "Le formulaire n'est pas encore relié à une base de données côté serveur. Contactez le bureau directement en attendant."
      );
    }
    console.error("Échec de l'enregistrement de la demande partenaire :", error);
    return htmlError("Une erreur est survenue. Réessayez plus tard.");
  }

  return NextResponse.redirect(new URL(`${backHref}?merci=1`, request.url), 303);
}
