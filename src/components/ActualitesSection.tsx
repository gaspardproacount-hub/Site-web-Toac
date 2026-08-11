import { ACTUALITES } from "@/content/actualites";
import { CmsEditableText, CmsAddTile, CmsEditPencil } from "@/components/cms-edit";
import type { CmsCatalogSection } from "@/lib/cms";

/**
 * Bloc "Actualités" : liste de cartes éditables via le CMS (section catalogue
 * nommée exactement "Actualités"). Tant que cette section n'existe pas côté
 * dashboard, affiche le contenu de secours (@/content/actualites), non
 * éditable. Réutilisable sur n'importe quelle page.
 */
export default function ActualitesSection({ catalog }: { catalog: CmsCatalogSection[] | null }) {
  const actualitesSection = catalog?.find((s) => s.name === "Actualités");

  return (
    <section className="bg-toac-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950 sm:text-3xl">
          Actualités
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {actualitesSection
            ? actualitesSection.products.map((news) => (
                <article
                  key={news.id}
                  className="relative rounded-lg border border-toac-gray-200 bg-white p-5 pr-9 shadow-sm transition hover:shadow-md"
                >
                  <CmsEditPencil
                    payload={{ type: "edit-product", productId: news.id }}
                    className="absolute right-2 top-2 h-6 w-6 text-[10px]"
                  />
                  <CmsEditableText
                    as="h3"
                    value={news.name}
                    target={{ kind: "product", id: news.id, field: "name" }}
                    className="font-display text-base uppercase text-toac-blue-950"
                  />
                  <CmsEditableText
                    as="p"
                    value={news.description}
                    target={{ kind: "product", id: news.id, field: "description" }}
                    multiline
                    className="mt-2 block text-sm text-toac-blue-900/70"
                  />
                </article>
              ))
            : ACTUALITES.map((news) => (
                <article
                  key={news.slug}
                  className="rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <time className="text-xs uppercase tracking-wide text-toac-blue-600" dateTime={news.date}>
                    {new Date(news.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <h3 className="mt-2 font-display text-base uppercase text-toac-blue-950">{news.title}</h3>
                  <p className="mt-2 text-sm text-toac-blue-900/70">{news.excerpt}</p>
                </article>
              ))}
          {actualitesSection && (
            <CmsAddTile
              payload={{ type: "add-product", sectionId: actualitesSection.id }}
              label="+ Ajouter une actualité"
            />
          )}
        </div>
      </div>
    </section>
  );
}
