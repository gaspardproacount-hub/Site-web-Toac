import "server-only";
import { put, type PutBlobResult } from "@vercel/blob";

/**
 * Accès à Vercel Blob (stockage des justificatifs d'adhésion et des décharges
 * musculation).
 *
 * Pourquoi ce module plutôt qu'un appel direct à `put()` :
 *
 *  1. `@vercel/blob` lit `process.env.BLOB_READ_WRITE_TOKEN` tout seul, mais ce
 *     nom de variable est « réservé » par l'intégration Storage de Vercel :
 *     quand la liaison entre le projet et le store Blob est cassée (store
 *     recréé, projet dupliqué, variable ajoutée à la main par-dessus une
 *     variable système…), la variable peut apparaître dans le dashboard sans
 *     jamais être injectée dans la fonction au runtime. On accepte donc aussi
 *     un nom de repli, `TOAC_BLOB_TOKEN`, que Vercel ne gère pas : le
 *     renseigner avec la même valeur débloque la situation.
 *  2. On distingue « pas de jeton du tout » (erreur de configuration, message
 *     d'installation) d'une vraie erreur d'upload (jeton invalide, store
 *     suspendu, réseau…), que `@vercel/blob` regroupe toutes sous la classe
 *     `BlobError`.
 */

/** Noms de variables d'environnement acceptés, dans l'ordre de priorité. */
export const BLOB_TOKEN_ENV_NAMES = ["BLOB_READ_WRITE_TOKEN", "TOAC_BLOB_TOKEN"] as const;

export class BlobNotConfiguredError extends Error {
  constructor() {
    super(
      "Aucun jeton Vercel Blob trouvé au runtime. Renseignez BLOB_READ_WRITE_TOKEN " +
        "(ou TOAC_BLOB_TOKEN en repli) dans les variables d'environnement du projet, " +
        "puis redéployez — voir README, section 6bis."
    );
    this.name = "BlobNotConfiguredError";
  }
}

/** Renvoie le jeton Blob et le nom de la variable qui l'a fourni, ou null. */
export function resolveBlobToken(): { token: string; source: string } | null {
  for (const name of BLOB_TOKEN_ENV_NAMES) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim() !== "") {
      return { token: value.trim(), source: name };
    }
  }
  return null;
}

/**
 * `put()` de @vercel/blob, mais avec le jeton passé explicitement (jamais via
 * la détection automatique) et une erreur claire s'il manque.
 */
export async function putBlob(
  pathname: string,
  body: Parameters<typeof put>[1],
  options: { contentType?: string } = {}
): Promise<PutBlobResult> {
  const resolved = resolveBlobToken();
  if (!resolved) throw new BlobNotConfiguredError();

  return put(pathname, body, {
    access: "public",
    token: resolved.token,
    ...(options.contentType ? { contentType: options.contentType } : {}),
  });
}
