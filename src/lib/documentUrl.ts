/**
 * Liens vers les documents du store Blob privé, servis par /api/documents après
 * contrôle d'accès. Module utilisable côté serveur comme côté client (pas de
 * `server-only` : il ne fait que construire des chaînes).
 */

/**
 * Titre du document, ex. « Décharge-Musculation-Dupont-Jean ». Il sert à la fois
 * de métadonnée `/Title` du PDF et de base au nom de fichier.
 */
export function buildDechargeDocumentTitle(nom: string, prenom: string): string {
  const part = (value: string) =>
    value
      .trim()
      // Espaces, apostrophes et tirets déjà présents deviennent un séparateur
      // unique, pour un titre lisible quel que soit le nom saisi.
      .replace(/[\s_'’]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  return ["Décharge", "Musculation", part(nom), part(prenom)].filter(Boolean).join("-");
}

/**
 * Nom de fichier dérivé du titre : sans accent ni caractère exotique, pour
 * rester valable sur tous les systèmes, tenir dans une URL et éviter d'avoir à
 * encoder l'en-tête Content-Disposition.
 */
export function buildDechargeFileName(nom: string, prenom: string, extension = ".pdf"): string {
  const base = buildDechargeDocumentTitle(nom, prenom)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9-]/g, "");
  return base ? `${base}${extension}` : `document${extension}`;
}

/**
 * Lien vers un document.
 *
 * Le nom de fichier est placé dans le CHEMIN, pas seulement dans l'en-tête
 * Content-Disposition : le lecteur PDF de Chrome titre son onglet d'après le
 * dernier segment de l'URL, en ignorant aussi bien la métadonnée `/Title` du
 * document que le `filename` de l'en-tête. Sans ce segment, tous les documents
 * s'appellent « documents » dans la barre d'onglets.
 *
 * @param path     Chemin du fichier dans le store, tel que conservé en base.
 * @param token    Jeton du dossier de décharge, pour l'adhérent qui relit ses
 *                 propres documents sans compte. Inutile pour le bureau.
 * @param options  `download` force le téléchargement ; `filename` nomme l'onglet
 *                 et le fichier enregistré.
 */
export function documentHref(
  path: string,
  token?: string,
  options: { download?: boolean; filename?: string } = {}
): string {
  const params = new URLSearchParams({ path });
  if (token) params.set("token", token);
  if (options.download) params.set("dl", "1");

  const segment = options.filename ? `/${encodeURIComponent(options.filename)}` : "";
  return `/api/documents${segment}?${params.toString()}`;
}
