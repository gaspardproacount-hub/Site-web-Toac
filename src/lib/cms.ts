// Connexion en direct au CMS Devanture (Supabase) pour le site du TOAC Triathlon.
// Ne concerne QUE les pages publiques/vitrine — l'espace adhérents (comptes,
// dossiers, paiements) reste géré séparément par sa propre base de données.
// Si CMS_CONFIG.siteId n'est pas renseigné, toutes les fonctions ci-dessous
// renvoient null et les pages gardent leur contenu actuel (src/content/*).

const CMS_CONFIG = {
  supabaseUrl: "VOTRE_SUPABASE_URL",
  supabaseAnonKey: "VOTRE_SUPABASE_ANON_KEY",
  siteId: "VOTRE_SITE_ID",
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

export async function getCmsPageBlocks(slug: string): Promise<CmsPageBlock[] | null> {
  if (!isConfigured) return null;

  const pages = await fetchFromCms<{ id: string }>(
    "pages",
    "&slug=eq." + encodeURIComponent(slug) + "&select=id"
  );
  const page = pages && pages[0];
  if (!page) return null;

  const blocksUrl =
    CMS_CONFIG.supabaseUrl + "/rest/v1/page_blocks?page_id=eq." + page.id + "&select=*&order=position.asc";

  try {
    const res = await fetch(blocksUrl, {
      headers: {
        apikey: CMS_CONFIG.supabaseAnonKey,
        Authorization: "Bearer " + CMS_CONFIG.supabaseAnonKey,
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const blocks = (await res.json()) as CmsPageBlock[];
    return blocks.length ? blocks : null;
  } catch {
    return null;
  }
}
