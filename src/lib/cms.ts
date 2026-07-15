// Connexion en direct au CMS Devanture (Supabase) pour le site du TOAC Triathlon.
// Ne concerne QUE les pages publiques/vitrine — l'espace adhérents (comptes,
// dossiers, paiements) reste géré séparément par sa propre base de données.
// Si CMS_CONFIG.siteId n'est pas renseigné, toutes les fonctions ci-dessous
// renvoient null et les pages gardent leur contenu actuel (src/content/*).

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
};

export type CmsProduct = {
  id: string;
  section_id: string | null;
  name: string;
  description: string;
  price: number | null;
  image_url: string | null;
  position: number;
};

export type CmsCatalogSection = {
  id: string;
  name: string;
  position: number;
  products: CmsProduct[];
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
