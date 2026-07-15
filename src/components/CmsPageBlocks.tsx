import type { ReactNode } from "react";
import { getCmsPageBlocks } from "@/lib/cms";
import { CmsEditPencil, CmsAddTile } from "@/components/cms-edit";

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
            <CmsEditPencil
              payload={{ type: "edit-block", blockId: block.id }}
              className="absolute -right-2 -top-2"
            />
            {block.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={block.image_url}
                alt={block.heading}
                className="mb-6 aspect-video w-full rounded-lg object-cover"
              />
            )}
            {block.heading && (
              <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950">
                {block.heading}
              </h2>
            )}
            {block.body && (
              <div className="mt-6 space-y-4 whitespace-pre-line text-toac-blue-900/90">{block.body}</div>
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
