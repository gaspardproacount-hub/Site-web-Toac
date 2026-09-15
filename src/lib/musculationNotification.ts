import "server-only";
import { buildDechargeFileName, documentHref } from "@/lib/documentUrl";

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
  /** Identité de l'adhérent, pour reconnaître le dossier sans ouvrir le PDF. */
  nom: string;
  prenom: string;
}

/**
 * Le nom et le prénom viennent d'un formulaire public : ils sont insérés dans du
 * HTML, donc échappés avant d'y entrer.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type NotificationResult = "sent" | "skipped";

/** Nombre d'adresses exploitables, pour la page de diagnostic. */
export function countNotificationRecipients(): number {
  return resolveRecipients().length;
}

/**
 * Contrôle volontairement permissif : il ne s'agit pas de valider une adresse
 * dans les règles, seulement d'écarter ce qui ferait rejeter tout l'envoi par
 * Brevo — un fragment sans arobase, ou plusieurs adresses restées collées.
 */
const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;

/**
 * Destinataires de la notification, lus dans MUSCULATION_NOTIFICATION_EMAILS.
 *
 * La saisie est humaine et le champ « Value » de Vercel est une zone de texte
 * multiligne : les adresses peuvent aussi bien être séparées par des virgules
 * que par des points-virgules, des espaces ou des retours à la ligne. Découper
 * sur la seule virgule transformait « une adresse par ligne » en un unique
 * destinataire invalide, que Brevo rejetait en bloc — aucun message ne partait,
 * et rien n'apparaissait dans ses statistiques.
 *
 * Les entrées qui ne ressemblent pas à une adresse sont écartées et
 * journalisées, plutôt que de faire échouer l'envoi aux autres destinataires.
 */
function resolveRecipients(): string[] {
  const entries = (process.env.MUSCULATION_NOTIFICATION_EMAILS ?? "")
    .split(/[,;\s]+/)
    .map((address) => address.trim())
    .filter(Boolean);

  const valid = entries.filter((address) => EMAIL_PATTERN.test(address));
  const rejected = entries.filter((address) => !EMAIL_PATTERN.test(address));

  if (rejected.length > 0) {
    console.warn(
      "[musculation] Entrées ignorées dans MUSCULATION_NOTIFICATION_EMAILS (adresse invalide) :",
      rejected
    );
  }

  // Une même adresse saisie deux fois ferait recevoir le message en double.
  return Array.from(new Set(valid.map((address) => address.toLowerCase())));
}

function buildHtml(
  viewUrl: string,
  downloadUrl: string,
  adherent: { nom: string; prenom: string }
): string {
  const button = (href: string, label: string, background: string) =>
    `<a href="${href}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;` +
    `background:${background};color:#ffffff;text-decoration:none;border-radius:6px;` +
    `font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;` +
    `letter-spacing:0.04em;">${label}</a>`;

  return `<!doctype html>
<html lang="fr">
<body style="margin:0;padding:24px;background:#f5f6f8;font-family:Helvetica,Arial,sans-serif;color:#0b1a3a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:28px;">
    <p style="margin:0 0 16px;font-size:16px;line-height:1.5;">
      Un adhérent du TOAC Triathlon a transmis son certificat médical et sa décharge pour la salle de musculation.
    </p>
    <table style="margin:0 0 24px;border-collapse:collapse;font-size:15px;line-height:1.6;">
      <tr>
        <td style="padding:0 12px 0 0;color:#5b6478;">Nom</td>
        <td style="font-weight:bold;">${escapeHtml(adherent.nom)}</td>
      </tr>
      <tr>
        <td style="padding:0 12px 0 0;color:#5b6478;">Prénom</td>
        <td style="font-weight:bold;">${escapeHtml(adherent.prenom)}</td>
      </tr>
    </table>
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

  // Le nom du fichier est dans le chemin de l'URL : c'est de là que le lecteur
  // PDF de Chrome tire le titre de son onglet.
  const filename = buildDechargeFileName(input.nom, input.prenom);
  const viewUrl = input.origin + documentHref(input.documentPath, input.token, { filename });
  const downloadUrl =
    input.origin + documentHref(input.documentPath, input.token, { filename, download: true });

  if (recipients.length === 0) {
    console.warn(
      "[musculation] Aucun destinataire exploitable dans MUSCULATION_NOTIFICATION_EMAILS — " +
        "notification non envoyée."
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
      // L'expéditeur réel vient de BREVO_FROM_EMAIL quand elle est définie ;
      // l'adresse ci-dessous n'est que le repli. Dans les deux cas, Brevo exige
      // que l'adresse soit un expéditeur vérifié du compte (Senders, Domains &
      // Dedicated IPs → Senders), sinon l'envoi est refusé.
      sender: {
        name: "TOAC Triathlon",
        email: process.env.BREVO_FROM_EMAIL ?? "contact@toac-triathlon.com",
      },
      to: recipients.map((email) => ({ email })),
      // Le nom dans l'objet permet de repérer le dossier depuis la liste des
      // messages, sans ouvrir l'email.
      subject: `[TOAC] Décharge salle de musculation — ${input.prenom} ${input.nom}`,
      htmlContent: buildHtml(viewUrl, downloadUrl, input),
      textContent:
        "Un adhérent du TOAC Triathlon a transmis son certificat médical et sa décharge pour la salle de musculation.\n\n" +
        `Nom : ${input.nom}\n` +
        `Prénom : ${input.prenom}\n\n` +
        `Voir le document : ${viewUrl}\n` +
        `Télécharger le document : ${downloadUrl}\n`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo a répondu ${response.status} : ${await response.text()}`);
  }

  return "sent";
}
