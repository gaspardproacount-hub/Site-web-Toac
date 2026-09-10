import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import EnsureCmsBlocks, { type EnsureBlockSpec } from "@/components/EnsureCmsBlocks";
import { CmsEditableText, CmsEditableImage, CmsEditPencil } from "@/components/cms-edit";
import { renderRichText } from "@/lib/rich-text";
import { getCmsPageBlocks, getCmsHiddenBlocks, type CmsPageBlock } from "@/lib/cms";
import { REGLEMENT_ARTICLES } from "@/content/reglement-interieur";

export const metadata: Metadata = pageMetadata({
  title: "Natation : créneaux et inscriptions",
  description:
    "Créneaux de natation du TOAC Triathlon : accès à la piscine, inscription aux séances et organisation des entraînements encadrés.",
  path: "/natation",
});

const ORGANISATION_BODY = REGLEMENT_ARTICLES.find((a) => a.slot === "annexe-1")?.body ?? "";

const ACCES_SLOT = "natation-acces-piscine";
const INSCRIPTION_SLOT = "natation-inscription";
const ORGANISATION_SLOT = "natation-organisation";

const DEFAULT_SECTIONS: Record<string, { heading: string; body: string }> = {
  [ACCES_SLOT]: {
    heading: "Accès à la piscine",
    body: "Chaque adhérent doit obligatoirement scanner ce QR code avant chaque séance.",
  },
  [INSCRIPTION_SLOT]: {
    heading: "Inscription aux séances",
    body: "Chaque adhérent doit obligatoirement être inscrit à la séance pour pouvoir y accéder.",
  },
  [ORGANISATION_SLOT]: {
    heading: "Organisation des entraînements",
    body: ORGANISATION_BODY,
  },
};

function TextSection({ slot, block }: { slot: string; block?: CmsPageBlock }) {
  const fallback = DEFAULT_SECTIONS[slot];
  return (
    <section id={slot} className="scroll-mt-24 border-t border-toac-gray-200 pt-8 first:border-0 first:pt-0">
      {block ? (
        <CmsEditableText
          as="h2"
          value={block.heading}
          target={{ kind: "block", id: block.id, field: "heading" }}
          className="font-display text-lg uppercase text-toac-blue-950"
        />
      ) : (
        <h2 className="font-display text-lg uppercase text-toac-blue-950">{fallback.heading}</h2>
      )}
      {block ? (
        <CmsEditableText
          as="div"
          value={block.body}
          target={{ kind: "block", id: block.id, field: "body" }}
          multiline
          className="mt-3 block space-y-3 whitespace-pre-line text-sm text-toac-blue-900/90"
        />
      ) : (
        <div className="mt-3 space-y-3 text-sm text-toac-blue-900/90">{renderRichText(fallback.body)}</div>
      )}
    </section>
  );
}

export default async function NatationPage() {
  const [cmsBlocks, hiddenBlocks] = await Promise.all([
    getCmsPageBlocks("natation"),
    getCmsHiddenBlocks("natation"),
  ]);

  const hiddenSlots = new Set(hiddenBlocks.map((b) => b.slot).filter(Boolean));
  const blockBySlot = new Map((cmsBlocks ?? []).filter((b) => b.slot).map((b) => [b.slot as string, b]));

  const missingSlots: EnsureBlockSpec[] = Object.entries(DEFAULT_SECTIONS)
    .filter(([slot]) => !blockBySlot.has(slot) && !hiddenSlots.has(slot))
    .map(([slot, s]) => ({ slot, heading: s.heading, body: s.body }));

  const accesBlock = blockBySlot.get(ACCES_SLOT);
  const inscriptionBlock = blockBySlot.get(INSCRIPTION_SLOT);
  const organisationBlock = blockBySlot.get(ORGANISATION_SLOT);

  return (
    <Suspense fallback={null}>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EnsureCmsBlocks slug="natation" blocks={missingSlots} />
        <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">Natation</h1>

        <div className="mt-10 space-y-8">
          <TextSection slot={ACCES_SLOT} block={accesBlock} />

          {accesBlock && (
            <div className="relative max-w-xs">
              <CmsEditPencil
                payload={{ type: "edit-block", blockId: accesBlock.id }}
                className="absolute -right-2 -top-2 h-6 w-6 text-[10px]"
              />
              <CmsEditableImage
                src={accesBlock.image_url}
                alt="QR code d'accès à la piscine"
                target={{ kind: "block", id: accesBlock.id }}
                className="block aspect-square w-full overflow-hidden rounded-lg border border-toac-gray-200 bg-white p-4"
                imgClassName="h-full w-full object-contain"
                zoomable
              />
            </div>
          )}

          <TextSection slot={INSCRIPTION_SLOT} block={inscriptionBlock} />
          <TextSection slot={ORGANISATION_SLOT} block={organisationBlock} />
        </div>
      </div>
    </Suspense>
  );
}
