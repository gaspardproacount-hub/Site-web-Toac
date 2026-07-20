import type { ReactNode } from "react";
import { getCmsPageBlocks } from "@/lib/cms";
import { CmsEditableText, CmsEditableImage, CmsAddTile } from "@/components/cms-edit";

// Rend le contenu géré par le dashboard client pour une page donnée (identifiée
// par son "slug", ex: "le-club"). Si aucun bloc n'a été créé pour cette page
// dans le CMS, on affiche le contenu actuel du site tel quel (fallback) — rien
// ne change sur le site tant que le client n'a pas commencé à éditer cette page.
export async function CmsPageBlocks({ slug, fallback }: { slug: string; fallback: ReactNode }) {
  const blocks = await getCmsPageBlocks(slug);

  if (!blocks) {
    return (
      <>
        {fallback}
        <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <CmsAddTile payload={{ type: "add-block" }} label="+ Ajouter un bloc de contenu sur cette page" />
        </div>
      </>
    );
  }

  return (
    <>
      {blocks.map((block) => (
        <section key={block.id} className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="relative rounded-lg">
            {block.image_url && (
              <CmsEditableImage
                src={block.image_url}
                alt={block.heading}
                target={{ kind: "block", id: block.id }}
                className="mb-6 aspect-video w-full overflow-hidden rounded-lg"
                imgClassName="aspect-video w-full rounded-lg object-cover"
              />
            )}
            {block.heading && (
              <CmsEditableText
                as="h2"
                value={block.heading}
                target={{ kind: "block", id: block.id, field: "heading" }}
                className="section-title font-display text-2xl uppercase text-toac-blue-950"
              />
            )}
            {block.body && (
              <CmsEditableText
                as="div"
                value={block.body}
                target={{ kind: "block", id: block.id, field: "body" }}
                multiline
                className="mt-6 block space-y-4 whitespace-pre-line text-toac-blue-900/90"
              />
            )}
          </div>
        </section>
      ))}
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <CmsAddTile payload={{ type: "add-block" }} label="+ Ajouter un bloc de contenu sur cette page" />
      </div>
    </>
  );
}
