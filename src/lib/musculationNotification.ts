import "server-only";

/**
 * Notification envoyée au club quand un adhérent valide son dossier « salle de
 * musculation ». Les destinataires sont libres : renseignez
 * MUSCULATION_NOTIFICATION_EMAILS (adresses séparées par des virgules) dans les
 * variables d'environnement du projet — aucune adresse n'est codée en dur, elles
 * se changent sans toucher au code ni redéployer une nouvelle version.
 *
 * Sans BREVO_API_KEY ou sans destinataire, rien n'est envoyé : la notification
 * est simplement journalisée. Un échec d'envoi ne doit jamais faire échouer la
 * validation du dossier — c'est à l'appelant de traiter l'erreur comme telle.
 */

export interface MusculationNotificationInput {
  /** URL absolue du site, pour construire des liens cliquables dans l'email. */
  origin: string;
  /** Chemin du PDF dans le store Blob. */
  documentPath: string;
  /** Jeton du dossier : il autorise le destinataire à ouvrir ce document. */
  token: string;
}

export type NotificationResult = "sent" | "skipped";

function resolveRecipients(): string[] {
  return (process.env.MUSCULATION_NOTIFICATION_EMAILS ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

function buildHtml(viewUrl: string, downloadUrl: string): string {
  const button = (href: string, label: string, background: string) =>
    `<a href="${href}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;` +
    `background:${background};color:#ffffff;text-decoration:none;border-radius:6px;` +
    `font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;` +
    `letter-spacing:0.04em;">${label}</a>`;

  return `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:24px;background:#f5f6f8;font-family:Helvetica,Arial,sans-serif;color:#0b1a3a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:28px;">
    <p style="margin:0 0 24px;font-size:16px;line-height:1.5;">
      Un adhérent du TOAC Triathlon a transmis son certificat médical et sa décharge pour la salle de musculation.
    </p>
    <p style="margin:0 0 8px;">
      ${button(viewUrl, "VOIR LE DOCUMENT", "#0b1a3a")}${button(downloadUrl, "TÉLÉCHARGER LE DOCUMENT", "#8c8c99")}
    </p>
    <p style="margin:16px 0 0;font-size:13px;color:#5b6478;line-height:1.5;">
      Le document est un PDF : la décharge signée, suivie du certificat médical.
    </p>
  </div>
</body>
</html>`;
}

export async function sendMusculationNotification(
  input: MusculationNotificationInput
): Promise<NotificationResult> {
  const recipients = resolveRecipients();
  const apiKey = process.env.BREVO_API_KEY;

  const base = `${input.origin}/api/documents?path=${encodeURIComponent(input.documentPath)}&token=${encodeURIComponent(input.token)}`;
  const viewUrl = base;
  const downloadUrl = `${base}&dl=1`;

  if (recipients.length === 0) {
    console.info(
      "[musculation] MUSCULATION_NOTIFICATION_EMAILS non renseignée — aucune notification envoyée."
    );
    return "skipped";
  }
  if (!apiKey) {
    console.info("[musculation] BREVO_API_KEY non configurée — notification journalisée uniquement:", {
      recipients,
      viewUrl,
    });
    return "skipped";
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Site TOAC Triathlon",
        email: process.env.BREVO_FROM_EMAIL ?? "site@toac-triathlon.com",
      },
      to: recipients.map((email) => ({ email })),
      subject: "[TOAC] Décharge salle de musculation transmise",
      htmlContent: buildHtml(viewUrl, downloadUrl),
      textContent:
        "Un adhérent du TOAC Triathlon a transmis son certificat médical et sa décharge pour la salle de musculation.\n\n" +
        `Voir le document : ${viewUrl}\n` +
        `Télécharger le document : ${downloadUrl}\n`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo a répondu ${response.status} : ${await response.text()}`);
  }

  return "sent";
}
