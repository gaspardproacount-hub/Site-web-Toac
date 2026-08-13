// Connexion en direct au CMS Devanture (Supabase) pour le site du TOAC Triathlon.
// Ne concerne QUE les pages publiques/vitrine — l'espace adhérents (comptes,
// dossiers, paiements) reste géré séparément par sa propre base de données.
// Si CMS_CONFIG.siteId n'est pas renseigné, toutes les fonctions ci-dessous
// renvoient null et les pages gardent leur contenu actuel (src/content/*).

import type { NavItem, NavLink } from "@/lib/nav";

const CMS_CONFIG = {
  supabaseUrl: "https://kekjsyqakhpuzxxeralm.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtla2pzeXFha2hwdXp4eGVyYWxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDgwNDAsImV4cCI6MjA5OTYyNDA0MH0.vZdboaaVCYThBNH4zXGrb8gEYXwzmk5uHCoPiLFXhUI",
  siteId: "f75cad77-b956-4822-83ff-bee764af2b4d",
};

const isConfigured =
  CMS_CONFIG.supabaseUrl.startsWith("https://") &&
  CMS_CONFIG.supabaseAnonKey.length > 20 &&
  CMS_CONFIG.siteId.length > 10;

export type CmsPageBlock = {
  id: string;
  heading: string;
  body: string;
  image_url: string | null;
  position: number;
  slot: string | null;
};

export type CmsSiteSettings = {
  business_name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: { jour: string; horaires: string }[];
  social_links: { facebook?: string; instagram?: string; site_web?: string; reservation_url?: string };
  theme?: { pink?: string; blue?: string };
};

export type CmsProduct = {
  id: string;
  section_id: string | null;
  name: string;
  description: string;
  price: number | null;
  image_url: string | null;
  url: string | null;
  position: number;
};

export type CmsCatalogSection = {
  id: string;
  name: string;
  position: number;
  products: CmsProduct[];
};

type CmsNavRow = {
  id: string;
  parent_id: string | null;
  label: string;
  href: string;
  protected: boolean;
  nav_position: number | null;
  footer_position: number | null;
};

async function fetchFromCms<T>(table: string, query: string): Promise<T[] | null> {
  if (!isConfigured) return null;

  const url =
    CMS_CONFIG.supabaseUrl + "/rest/v1/" + table + "?site_id=eq." + CMS_CONFIG.siteId + query;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: CMS_CONFIG.supabaseAnonKey,
        Authorization: "Bearer " + CMS_CONFIG.supabaseAnonKey,
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T[];
  } catch {
    return null;
  }
}

export async function getCmsSiteSettings(): Promise<CmsSiteSettings | null> {
  const rows = await fetchFromCms<CmsSiteSettings>("site_settings", "&select=*");
  return rows && rows[0] ? rows[0] : null;
}

export async function getCmsCatalog(): Promise<CmsCatalogSection[] | null> {
  const [sections, products] = await Promise.all([
    fetchFromCms<{ id: string; name: string; position: number }>(
      "catalog_sections",
      "&select=*&order=position.asc"
    ),
    fetchFromCms<CmsProduct>("products", "&select=*&order=position.asc"),
  ]);

  const hasSections = Boolean(sections && sections.length);
  const hasProducts = Boolean(products && products.length);
  if (!hasSections && !hasProducts) return null;

  const result: CmsCatalogSection[] = (sections ?? []).map((section) => ({
    ...section,
    products: (products ?? []).filter((p) => p.section_id === section.id),
  }));

  const unassigned = (products ?? []).filter((p) => !p.section_id);
  if (unassigned.length) {
    result.push({ id: "unassigned", name: "Autres", position: result.length, products: unassigned });
  }

  return result;
}

/**
 * Renvoie null seulement si aucune page CMS de ce slug n'existe (le contenu
 * par défaut du code s'applique alors). Dès que la page existe, son tableau
 * de blocs est renvoyé tel quel — y compris vide — pour qu'un admin puisse
 * volontairement vider une page (tout supprimer) sans faire réapparaître le
 * contenu par défaut : un tableau vide affiche "rien", pas le texte du code.
 */
export async function getCmsPageBlocks(slug: string): Promise<CmsPageBlock[] | null> {
  if (!isConfigured) return null;

  const pages = await fetchFromCms<{ id: string }>(
    "pages",
    "&slug=eq." + encodeURIComponent(slug) + "&select=id"
  );
  const page = pages && pages[0];
  if (!page) return null;

  const blocksUrl =
    CMS_CONFIG.supabaseUrl +
    "/rest/v1/page_blocks?page_id=eq." +
    page.id +
    "&hidden=eq.false&select=*&order=position.asc";

  try {
    const res = await fetch(blocksUrl, {
      headers: {
        apikey: CMS_CONFIG.supabaseAnonKey,
        Authorization: "Bearer " + CMS_CONFIG.supabaseAnonKey,
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as CmsPageBlock[];
  } catch {
    return null;
  }
}

export type CmsHiddenBlock = { slot: string | null; heading: string };

/**
 * Blocs masqués (page_blocks.hidden = true) pour une page — utilisé par les
 * blocs "à emplacement fixe" qui ont un texte par défaut codé en dur : sans
 * ça, masquer un tel bloc dans le CMS le fait juste disparaître de
 * getCmsPageBlocks, et la page réaffiche le texte par défaut à la place (qui
 * a souvent le même contenu), donnant l'impression que "masquer" ne marche
 * pas. Ne concerne pas les blocs libres, qui n'ont pas de texte par défaut :
 * ils disparaissent déjà correctement quand ils sont masqués.
 * Renvoie slot ET heading (pas que le slot) car un bloc masqué créé avant
 * l'existence des slots n'en a pas encore — il ne serait alors identifiable
 * que par son ancien titre exact, comme pour findSlot côté page.
 */
export async function getCmsHiddenBlocks(slug: string): Promise<CmsHiddenBlock[]> {
  if (!isConfigured) return [];

  const pages = await fetchFromCms<{ id: string }>(
    "pages",
    "&slug=eq." + encodeURIComponent(slug) + "&select=id"
  );
  const page = pages && pages[0];
  if (!page) return [];

  const url =
    CMS_CONFIG.supabaseUrl +
    "/rest/v1/page_blocks?page_id=eq." +
    page.id +
    "&hidden=eq.true&select=slot,heading";

  try {
    const res = await fetch(url, {
      headers: {
        apikey: CMS_CONFIG.supabaseAnonKey,
        Authorization: "Bearer " + CMS_CONFIG.supabaseAnonKey,
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as CmsHiddenBlock[];
  } catch {
    return [];
  }
}

// Menu de navigation et pied de page gérés depuis le CMS (dashboard →
// Navigation). Renvoie null pour chaque liste quand le CMS n'a aucun lien
// configuré, pour que l'appelant garde le menu par défaut codé en dur.
export async function getCmsNavigation(): Promise<{
  nav: NavItem[] | null;
  footer: NavLink[] | null;
}> {
  const rows = await fetchFromCms<CmsNavRow>("nav_items", "&select=*");
  if (!rows || rows.length === 0) return { nav: null, footer: null };

  const byParent = new Map<string, CmsNavRow[]>();
  for (const row of rows) {
    if (!row.parent_id) continue;
    if (!byParent.has(row.parent_id)) byParent.set(row.parent_id, []);
    byParent.get(row.parent_id)!.push(row);
  }

  const nav: NavItem[] = rows
    .filter((row) => !row.parent_id && row.nav_position !== null)
    .sort((a, b) => (a.nav_position ?? 0) - (b.nav_position ?? 0))
    .map((row) => {
      const children = (byParent.get(row.id) ?? [])
        .filter((child) => child.nav_position !== null)
        .sort((a, b) => (a.nav_position ?? 0) - (b.nav_position ?? 0))
        .map((child) => ({ label: child.label, href: child.href, protected: child.protected }));
      return {
        label: row.label,
        href: row.href,
        children: children.length ? children : undefined,
      };
    });

  const footer: NavLink[] = rows
    .filter((row) => row.footer_position !== null)
    .sort((a, b) => (a.footer_position ?? 0) - (b.footer_position ?? 0))
    .map((row) => ({ label: row.label, href: row.href, protected: row.protected }));

  return {
    nav: nav.length ? nav : null,
    footer: footer.length ? footer : null,
  };
}
