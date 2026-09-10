import type { Metadata } from "next";

export const SITE_URL = "https://www.toac-triathlon.com";
export const SITE_NAME = "TOAC Triathlon";

export const DEFAULT_TITLE = "TOAC Triathlon — Club de triathlon à Toulouse";
export const DEFAULT_DESCRIPTION =
  "TOAC Triathlon, club toulousain affilié FFTRI depuis 1992 : entraînements encadrés en natation, vélo, course à pied et musculation, tous niveaux.";

type PageMetadataInput = {
  /** Titre court de la page, sans le suffixe de marque (ajouté par le template du layout). */
  title: string;
  /** Description unique de la page, idéalement 120-160 caractères. */
  description: string;
  /** Chemin canonique, ex. "/le-club/bureau". Utiliser "/" pour l'accueil. */
  path: string;
  /** Titre social, si le titre affiché en partage doit différer du titre HTML. */
  socialTitle?: string;
  /**
   * Pour l'accueil : utilise le titre tel quel, sans y accoler le suffixe de
   * marque du template du layout (qui produirait un doublon "TOAC Triathlon").
   */
  absoluteTitle?: boolean;
};

/**
 * Métadonnées d'une page publique indexable.
 *
 * Next.js n'hérite les métadonnées que clé par clé au premier niveau : une
 * page qui déclare seulement `title` récupère tel quel l'objet `openGraph` du
 * layout racine, donc les mêmes `og:title` / `og:description` que toutes les
 * autres. On reconstruit donc systématiquement openGraph et twitter à partir
 * du titre et de la description de la page.
 */
export function pageMetadata({
  title,
  description,
  path,
  socialTitle,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const fullTitle = socialTitle ?? (absoluteTitle ? title : `${title} — ${SITE_NAME}`);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: SITE_NAME,
      url: path,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

/**
 * Métadonnées d'une page non indexable (espace adhérents, confirmations de
 * paiement, connexion). On garde un titre distinct pour l'onglet du
 * navigateur et l'historique, sans openGraph ni canonique.
 */
export function privatePageMetadata(title: string, description?: string): Metadata {
  return {
    title,
    // `null` neutralise la métadonnée héritée du layout racine, pour ne pas
    // recopier la description de l'accueil sur toutes ces pages.
    description: description ?? null,
    robots: { index: false, follow: false },
    openGraph: null,
    twitter: null,
  };
}

/**
 * Normalise un texte libre venant du CMS en description meta : une seule
 * ligne, tronquée sur un mot autour de 155 caractères (limite d'affichage
 * usuelle dans les résultats Google). Retombe sur `fallback` si le texte est
 * vide, pour ne jamais laisser une page hériter de la description d'accueil.
 */
export function toMetaDescription(
  text: string | null | undefined,
  fallback: string,
): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  if (clean.length <= 155) return clean;
  const cut = clean.slice(0, 155);
  const lastSpace = cut.lastIndexOf(" ");
  const kept = lastSpace > 100 ? cut.slice(0, lastSpace) : cut;
  return `${kept.replace(/[\s,;:.]+$/, "")}…`;
}
