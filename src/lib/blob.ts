import "server-only";
import { put, get, type PutBlobResult, type GetBlobResult } from "@vercel/blob";

/**
 * Accès à Vercel Blob (justificatifs d'adhésion, décharges musculation et
 * certificats médicaux).
 *
 * Le store du club est configuré en **accès privé** : les fichiers y sont
 * déposés avec `access: "private"` et ne sont JAMAIS joignables par une URL
 * publique — il faut les relire côté serveur avec le jeton du store, après
 * contrôle d'accès (voir src/app/api/documents/route.ts). C'est ce qu'on veut
 * ici : un certificat médical est une donnée de santé, une URL publique reste
 * lisible par quiconque met la main dessus et ne peut pas être révoquée.
 *
 * L'accès (public/privé) est fixé à la création du store côté Vercel et n'est
 * pas modifiable ensuite : `put(..., { access: "public" })` sur ce store échoue
 * avec « Cannot use public access on a private store ».
 *
 * Le jeton est passé explicitement plutôt que laissé à la détection automatique
 * de @vercel/blob, et on accepte un nom de repli `TOAC_BLOB_TOKEN` au cas où
 * `BLOB_READ_WRITE_TOKEN` — nom géré par l'intégration Storage de Vercel — ne
 * serait pas injecté dans la fonction.
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

function requireToken(): string {
  const resolved = resolveBlobToken();
  if (!resolved) throw new BlobNotConfiguredError();
  return resolved.token;
}

/**
 * Dépose un fichier dans le store privé. Ce qu'il faut conserver en base est le
 * `pathname` du résultat (et non l'`url`) : c'est lui qui permet de relire le
 * fichier plus tard via {@link getBlobStream}.
 */
export async function putBlob(
  pathname: string,
  body: Parameters<typeof put>[1],
  options: { contentType?: string } = {}
): Promise<PutBlobResult> {
  return put(pathname, body, {
    access: "private",
    token: requireToken(),
    ...(options.contentType ? { contentType: options.contentType } : {}),
  });
}

/** Relit un fichier du store privé. Renvoie null si le fichier n'existe pas. */
export async function getBlobStream(
  pathname: string,
  options: { ifNoneMatch?: string } = {}
): Promise<GetBlobResult | null> {
  return get(pathname, {
    access: "private",
    token: requireToken(),
    ...(options.ifNoneMatch ? { ifNoneMatch: options.ifNoneMatch } : {}),
  });
}

/**
 * Les enregistrements créés avant le passage au store privé contiennent une URL
 * publique complète au lieu d'un pathname. On les reconnaît pour continuer à les
 * servir tels quels plutôt que de les chercher — en vain — dans le store privé.
 */
export function isLegacyPublicUrl(stored: string): boolean {
  return /^https?:\/\//i.test(stored);
}
