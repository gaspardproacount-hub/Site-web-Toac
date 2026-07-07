import "server-only";
import crypto from "node:crypto";

/**
 * Intégration Monetico Paiement (Crédit Mutuel / CIC) — "paiement par
 * formulaire scellé". Algorithme de dérivation de clé et de calcul du
 * sceau conforme à la documentation d'intégration officielle de Monetico.
 *
 * Toutes les valeurs sensibles viennent des variables d'environnement,
 * jamais du code source (voir .env.example).
 */

export interface MoneticoConfig {
  tpe: string;
  codeSociete: string;
  cleHmac: string;
  urlRetourOk: string;
  urlRetourErr: string;
  testMode: boolean;
}

/**
 * MONETICO_URL_RETOUR est l'URL de base du site (ex. https://toac-triathlon.vercel.app),
 * utilisée pour construire les pages de confirmation/échec vers lesquelles le
 * navigateur de l'adhérent est redirigé après le paiement.
 *
 * Ce n'est PAS l'URL de notification serveur-à-serveur (IPN) : celle-ci se
 * configure séparément dans l'espace commerçant Monetico et doit pointer vers
 * {MONETICO_URL_RETOUR}/api/monetico/retour.
 */
export function getMoneticoConfig(): MoneticoConfig {
  const tpe = process.env.MONETICO_TPE;
  const codeSociete = process.env.MONETICO_CODE_SOCIETE;
  const cleHmac = process.env.MONETICO_CLE_HMAC;
  const urlRetour = process.env.MONETICO_URL_RETOUR;

  if (!tpe || !codeSociete || !cleHmac || !urlRetour) {
    throw new Error(
      "Configuration Monetico incomplète. Renseignez MONETICO_TPE, MONETICO_CODE_SOCIETE, " +
        "MONETICO_CLE_HMAC et MONETICO_URL_RETOUR dans votre .env (voir .env.example)."
    );
  }

  return {
    tpe,
    codeSociete,
    cleHmac,
    urlRetourOk: `${urlRetour}/adhesion/confirmation`,
    urlRetourErr: `${urlRetour}/adhesion/echec`,
    testMode: process.env.MONETICO_TEST_MODE === "true",
  };
}

/** Dérive la "clé usable" HMAC à partir de la clé hexadécimale fournie par Monetico. */
function usableKey(hexKey: string): Buffer {
  const hexStrKey = hexKey.substring(0, 38);
  const hexFinal = hexKey.substring(38, 40) + "00";
  const cca0 = hexFinal.charCodeAt(0);

  let key: string;
  if (cca0 > 70 && cca0 < 97) {
    key = hexStrKey + String.fromCharCode(cca0 - 23) + hexFinal.substring(1, 2);
  } else if (hexFinal.substring(1, 2) === "M") {
    key = hexStrKey + hexFinal.substring(0, 1) + "0";
  } else {
    key = hexStrKey + hexFinal.substring(0, 2);
  }

  return Buffer.from(key, "hex");
}

/** Calcule le sceau MAC HMAC-SHA1 sur les champs fournis, dans l'ordre donné. */
export function computeSeal(
  fields: Record<string, string>,
  order: string[],
  cleHmac: string
): string {
  const message = order.map((key) => `${fields[key] ?? ""}*`).join("");
  const key = usableKey(cleHmac);
  return crypto
    .createHmac("sha1", key)
    .update(message, "utf8")
    .digest("hex")
    .toUpperCase();
}

export interface PaymentRequest {
  montantCentimes: number;
  reference: string;
  email: string;
  texteLibre?: string;
}

const FIELD_ORDER = [
  "TPE",
  "date",
  "montant",
  "reference",
  "texte-libre",
  "version",
  "lgue",
  "societe",
  "mail",
  "url_retour_ok",
  "url_retour_err",
];

/** Construit les champs (déjà scellés) du formulaire de paiement Monetico. */
export function buildPaymentForm(request: PaymentRequest) {
  const config = getMoneticoConfig();
  const montant = `${(request.montantCentimes / 100).toFixed(2)}EUR`;
  const date = new Date().toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });

  const fields: Record<string, string> = {
    TPE: config.tpe,
    date,
    montant,
    reference: request.reference,
    "texte-libre": request.texteLibre ?? "",
    version: "3.0",
    lgue: "FR",
    societe: config.codeSociete,
    mail: request.email,
    url_retour_ok: config.urlRetourOk,
    url_retour_err: config.urlRetourErr,
  };

  const mac = computeSeal(fields, FIELD_ORDER, config.cleHmac);

  return {
    actionUrl: config.testMode
      ? "https://p.monetico-services.com/test/paiement.cgi"
      : "https://p.monetico-services.com/paiement.cgi",
    fields: { ...fields, MAC: mac },
  };
}

/**
 * Vérifie le sceau renvoyé par Monetico sur la notification/retour de paiement.
 *
 * IMPORTANT : l'ordre exact des champs du retour Monetico dépend des options
 * activées sur le compte marchand (3-D Secure, filtrage, etc.) et doit être
 * confirmé avec la documentation Monetico fournie dans l'espace commerçant du
 * club avant la mise en production. Cette implémentation trie les champs par
 * ordre alphabétique de clé, convention utilisée par la plupart des kits
 * d'intégration Monetico — à valider en mode test avant le passage en réel.
 */
export function verifyReturnSeal(
  fields: Record<string, string>,
  receivedMac: string
): boolean {
  const config = getMoneticoConfig();
  const order = Object.keys(fields).filter((k) => k !== "MAC").sort();
  const computed = computeSeal(fields, order, config.cleHmac);
  const a = Buffer.from(computed);
  const b = Buffer.from(receivedMac.toUpperCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
