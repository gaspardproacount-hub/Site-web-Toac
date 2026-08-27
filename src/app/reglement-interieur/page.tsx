import type { Metadata } from "next";
import { Suspense } from "react";
import EnsureCmsBlocks, { type EnsureBlockSpec } from "@/components/EnsureCmsBlocks";
import { CmsEditableText, CmsAddTile } from "@/components/cms-edit";
import { renderRichText } from "@/lib/rich-text";
import { slugify } from "@/lib/slug";
import { getCmsPageBlocks, getCmsHiddenBlocks, type CmsPageBlock } from "@/lib/cms";
import { REGLEMENT_PREAMBULE, REGLEMENT_ARTICLES } from "@/content/reglement-interieur";

export const metadata: Metadata = {
  title: "Règlement intérieur",
  description: "Règlement intérieur du TOAC Triathlon.",
};

// Section d'article : texte "à emplacement fixe" (slot stable, ex.
// "article-3") si un bloc CMS existe déjà pour lui, sinon le texte par
// défaut de src/content/reglement-interieur.ts en attendant qu'EnsureCmsBlocks
// le crée automatiquement à la première ouverture de l'aperçu dashboard.
function ArticleSection({ id, heading, body, block }: { id: string; heading: string; body: string; block?: CmsPageBlock }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-toac-gray-200 pt-8">
      {block ? (
        <CmsEditableText
          as="h2"
          value={block.heading}
          target={{ kind: "block", id: block.id, field: "heading" }}
          className="font-display text-lg uppercase text-toac-blue-950"
        />
      ) : (
        <h2 className="font-display text-lg uppercase text-toac-blue-950">{heading}</h2>
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
        <div className="mt-3 space-y-3 text-sm text-toac-blue-900/90">{renderRichText(body)}</div>
      )}
    </section>
  );
}

export default async function ReglementInterieurPage() {
  const [cmsBlocks, hiddenBlocks] = await Promise.all([
    getCmsPageBlocks("reglement-interieur"),
    getCmsHiddenBlocks("reglement-interieur"),
  ]);

  const hiddenSlots = new Set(hiddenBlocks.map((b) => b.slot).filter(Boolean));
  const blockBySlot = new Map((cmsBlocks ?? []).filter((b) => b.slot).map((b) => [b.slot as string, b]));

  const knownSlots = new Set([REGLEMENT_PREAMBULE.slot, ...REGLEMENT_ARTICLES.map((a) => a.slot)]);
  // Articles ajoutés depuis le dashboard (bouton "+ Ajouter un article"),
  // sans slot connu à l'avance : affichés à la suite des articles ci-dessus.
  const extraBlocks = (cmsBlocks ?? []).filter((b) => !b.slot || !knownSlots.has(b.slot));

  const missingSlots: EnsureBlockSpec[] = [REGLEMENT_PREAMBULE, ...REGLEMENT_ARTICLES]
    .filter((a) => !blockBySlot.has(a.slot) && !hiddenSlots.has(a.slot))
    .map((a) => ({ slot: a.slot, heading: a.heading, body: a.body }));

  const preambuleBlock = blockBySlot.get(REGLEMENT_PREAMBULE.slot);

  const sommaire = [
    ...REGLEMENT_ARTICLES.map((a) => ({
      id: a.slot,
      label: blockBySlot.get(a.slot)?.heading || a.heading,
    })),
    ...extraBlocks.map((b) => ({ id: slugify(b.heading) || b.id, label: b.heading || "(sans titre)" })),
  ];

  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <EnsureCmsBlocks slug="reglement-interieur" blocks={missingSlots} />
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Règlement intérieur
      </h1>
      <p className="mt-2 text-xs uppercase tracking-wide text-toac-blue-900/50">
        TOAC Triathlon — Dernière mise à jour : août 2026
      </p>

      <div className="mt-8 space-y-3 text-sm text-toac-blue-900/90">
        {preambuleBlock ? (
          <CmsEditableText
            as="div"
            value={preambuleBlock.body}
            target={{ kind: "block", id: preambuleBlock.id, field: "body" }}
            multiline
            className="block space-y-3 whitespace-pre-line"
          />
        ) : (
          <div>{renderRichText(REGLEMENT_PREAMBULE.body)}</div>
        )}
      </div>

      <nav className="mt-10 rounded-lg border border-toac-gray-200 bg-toac-gray-50 p-4">
        <p className="font-display text-xs uppercase tracking-wide text-toac-blue-950">Sommaire</p>
        <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm text-toac-blue-600 sm:grid-cols-2">
          {sommaire.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="underline decoration-toac-blue-600/30 hover:decoration-toac-blue-600">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-8">
        {REGLEMENT_ARTICLES.map((a) => (
          <ArticleSection key={a.slot} id={a.slot} heading={a.heading} body={a.body} block={blockBySlot.get(a.slot)} />
        ))}
        {extraBlocks.map((block) => (
          <section
            key={block.id}
            id={slugify(block.heading) || block.id}
            className="scroll-mt-24 border-t border-toac-gray-200 pt-8"
          >
            <CmsEditableText
              as="h2"
              value={block.heading}
              target={{ kind: "block", id: block.id, field: "heading" }}
              className="font-display text-lg uppercase text-toac-blue-950"
            />
            <CmsEditableText
              as="div"
              value={block.body}
              target={{ kind: "block", id: block.id, field: "body" }}
              multiline
              className="mt-3 block space-y-3 whitespace-pre-line text-sm text-toac-blue-900/90"
            />
          </section>
        ))}
        <CmsAddTile payload={{ type: "add-block" }} label="+ Ajouter un article" />
      </div>
    </div>
    </Suspense>
  );
}
