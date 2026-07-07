import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildPaymentForm } from "@/lib/monetico";

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

  const inputs = Object.entries(payment.fields)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${key}" value="${escapeHtml(value)}" />`
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="fr">
  <head><meta charset="utf-8" /><title>Redirection vers le paiement sécurisé…</title></head>
  <body>
    <p>Redirection vers la page de paiement sécurisée Monetico…</p>
    <form id="monetico-form" action="${payment.actionUrl}" method="POST">
      ${inputs}
    </form>
    <script>document.getElementById('monetico-form').submit();</script>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
