import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildPaymentForm, buildAutoSubmitHtml } from "@/lib/monetico";
import { resolveTarifs } from "@/lib/tarifs-cms";

/**
 * Reçoit le choix de stage + l'email de l'adhérent depuis le formulaire
 * "Nous rejoindre", construit le formulaire scellé Monetico côté serveur
 * (la clé HMAC ne quitte jamais le serveur) et répond avec une page HTML
 * qui se soumet automatiquement vers la page de paiement sécurisée Monetico.
 *
 * Le montant soumis par le client est vérifié par rapport à la liste des
 * stages réellement configurés (CMS si présents, sinon statiques) : un
 * montant qui ne correspond à aucun stage connu est refusé, pour empêcher
 * qu'une requête modifiée ne fasse facturer un montant arbitraire.
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

  const tarifs = await resolveTarifs();
  const stage = tarifs.stages.find((t) => t.montantCentimes === montantCentimes);
  if (!stage) {
    return NextResponse.json(
      { error: "Ce tarif de stage n'est plus disponible. Rechargez la page et réessayez." },
      { status: 400 }
    );
  }

  let payment: ReturnType<typeof buildPaymentForm>;
  try {
    payment = buildPaymentForm({
      montantCentimes,
      reference,
      email,
      texteLibre: stage.label,
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
