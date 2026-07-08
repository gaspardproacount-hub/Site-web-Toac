import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildPaymentForm, buildAutoSubmitHtml } from "@/lib/monetico";

/**
 * Reçoit le choix de formule + l'email de l'adhérent depuis le formulaire
 * "Nous rejoindre", construit le formulaire scellé Monetico côté serveur
 * (la clé HMAC ne quitte jamais le serveur) et répond avec une page HTML
 * qui se soumet automatiquement vers la page de paiement sécurisée Monetico.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const montantCentimes = Number(form.get("montantCentimes") ?? 0);
  const reference = `TOAC-${Date.now()}`;

  if (!email || !montantCentimes) {
    return NextResponse.json(
      { error: "Email et tarif requis." },
      { status: 400 }
    );
  }

  let payment: ReturnType<typeof buildPaymentForm>;
  try {
    payment = buildPaymentForm({
      montantCentimes,
      reference,
      email,
      texteLibre: "Adhésion TOAC Triathlon",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Configuration Monetico manquante.",
      },
      { status: 500 }
    );
  }

  return new NextResponse(buildAutoSubmitHtml(payment), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
