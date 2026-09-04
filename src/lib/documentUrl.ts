/**
 * Lien vers un document du store Blob privé, servi par /api/documents après
 * contrôle d'accès. Utilisable côté serveur comme côté client (pas de
 * `server-only` ici, c'est de la simple construction d'URL).
 *
 * @param path  Chemin du fichier dans le store, tel que conservé en base.
 * @param token Jeton du dossier de décharge musculation, pour l'adhérent qui
 *              relit ses propres documents sans compte. Inutile pour le bureau.
 */
export function documentHref(
  path: string,
  token?: string,
  options: { download?: boolean } = {}
): string {
  const params = new URLSearchParams({ path });
  if (token) params.set("token", token);
  if (options.download) params.set("dl", "1");
  return `/api/documents?${params.toString()}`;
}
