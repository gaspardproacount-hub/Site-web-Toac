const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

/** Transforme "Chloé Vermorel" en "chloe-vermorel" (pour les noms de fichiers image). */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
