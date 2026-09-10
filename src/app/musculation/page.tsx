import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import MusculationDechargeForm from "@/components/MusculationDechargeForm";
import EnsureCmsBlocks, { type EnsureBlockSpec } from "@/components/EnsureCmsBlocks";
import { CmsEditableText, CmsAddTile } from "@/components/cms-edit";
import AccordionBlock from "@/components/AccordionBlock";
import { renderRichText } from "@/lib/rich-text";
import { getCmsPageBlocks, getCmsHiddenBlocks, type CmsPageBlock } from "@/lib/cms";
import { slugify } from "@/lib/slug";

// Page pas encore reliée au menu (voir src/lib/nav.ts) : elle reste accessible
// par son URL directe, mais elle est désormais indexable et présente dans le
// sitemap, ce qui suffit à Google pour la trouver sans lien dans la
// navigation.
export const metadata: Metadata = pageMetadata({
  title: "Musculation",
  description:
    "Salle de musculation du TOAC Triathlon : créneaux d'ouverture, encadrants, règles d'accès et décharge à signer en ligne.",
  path: "/musculation",
});

const CRENEAUX_SLOT = "musculation-creneaux";
const ENCADRANTS_SLOT = "musculation-encadrants";
const GARDIEN_SLOT = "musculation-gardien";
const CONDITIONS_SLOT = "musculation-conditions";
const DECHARGE_SLOT = "musculation-decharge";

const CALENDRIER_URL =
  "https://www.idosport.app/calendrier-partage/visualiser/lYzH6pXCPzSlQf-QWn0VoSSvi98/restricted";

/**
 * Contenu de départ de chaque section. Il sert deux fois : à l'affichage tant
 * qu'aucun bloc CMS n'existe, et comme contenu initial des blocs créés
 * automatiquement à l'ouverture de l'aperçu dans le dashboard (EnsureCmsBlocks).
 * Une fois les blocs créés, tout se modifie depuis le CMS.
 *
 * La syntaxe suit celle des autres pages (voir src/lib/rich-text.ts) : tableau
 * façon Markdown, « - » en début de ligne pour une puce, **gras**, et
 * [texte](url) pour un lien. Le dashboard propose des boutons qui l'écrivent.
 */
const DEFAULT_SECTIONS: Record<string, { heading: string; body: string }> = {
  [CRENEAUX_SLOT]: {
    heading: "Créneaux",
    body: [
      "| Jour | Horaires |",
      "| --- | --- |",
      "| Lundi | 7h – 9h |",
      "| Mardi | 7h – 9h et 12h45 – 14h |",
      "| Mercredi | 7h – 9h |",
      "| Jeudi | 7h – 9h, 13h – 14h et 18h – 19h |",
      "| Samedi | 9h30 – 11h |",
      "",
      `Retrouvez le calendrier partagé à jour sur [IDO](${CALENDRIER_URL}).`,
    ].join("\n"),
  },
  [ENCADRANTS_SLOT]: {
    heading: "Encadrants",
    body: [
      "- François PERRINEAU",
      "- Hugo PRÉZELIN",
      "- Billton VITUS",
      "- Aurélie VANNUTELLI",
      "- Anne LARRIBE",
      "- Damien MARTINS",
    ].join("\n"),
  },
  [GARDIEN_SLOT]: {
    heading: "Contact du gardien",
    body: "TOAC Gardien — **06 47 83 77 20**",
  },
  [CONDITIONS_SLOT]: {
    heading: "Conditions préalables",
    body: [
      "- Être au minimum 2 lors de la séance et maximum 12.",
      "- Présence obligatoire d'un encadrant pour gérer la séance et récupérer la clé à la sécurité au poste de garde, en échange d'une carte d'identité ou du badge Airbus.",
      "- Fournir un certificat médical et une décharge de responsabilité via le formulaire ci-dessous.",
    ].join("\n"),
  },
  [DECHARGE_SLOT]: {
    heading: "Décharge et certificat médical",
    body:
      "Complétez ce formulaire pour générer votre décharge à partir de vos informations et de votre " +
      "signature. Vous pourrez relire le document avant de le valider et de le transmettre, avec votre " +
      "certificat médical, au bureau du club.",
  },
};

function TextSection({
  slot,
  block,
  headingClassName = "font-display text-lg uppercase text-toac-blue-950",
  bodyClassName = "mt-3 block space-y-3 whitespace-pre-line text-sm text-toac-blue-900/90",
}: {
  slot: string;
  block?: CmsPageBlock;
  headingClassName?: string;
  bodyClassName?: string;
}) {
  const fallback = DEFAULT_SECTIONS[slot];
  return (
    <section id={slot} className="scroll-mt-24">
      {block ? (
        <CmsEditableText
          as="h2"
          value={block.heading}
          target={{ kind: "block", id: block.id, field: "heading" }}
          className={headingClassName}
        />
      ) : (
        <h2 className={headingClassName}>{fallback.heading}</h2>
      )}
      {block ? (
        <CmsEditableText
          as="div"
          value={block.body}
          target={{ kind: "block", id: block.id, field: "body" }}
          multiline
          className={bodyClassName}
        />
      ) : (
        <div className={bodyClassName}>{renderRichText(fallback.body)}</div>
      )}
    </section>
  );
}

export default async function MusculationPage() {
  const [cmsBlocks, hiddenBlocks] = await Promise.all([
    getCmsPageBlocks("musculation"),
    getCmsHiddenBlocks("musculation"),
  ]);

  const hiddenSlots = new Set(hiddenBlocks.map((b) => b.slot).filter(Boolean));
  const blockBySlot = new Map((cmsBlocks ?? []).filter((b) => b.slot).map((b) => [b.slot as string, b]));

  const missingSlots: EnsureBlockSpec[] = Object.entries(DEFAULT_SECTIONS)
    .filter(([slot]) => !blockBySlot.has(slot) && !hiddenSlots.has(slot))
    .map(([slot, s]) => ({ slot, heading: s.heading, body: s.body }));

  const dechargeBlock = blockBySlot.get(DECHARGE_SLOT);

  // Blocs ajoutés depuis le dashboard (Dashboard → Pages → Musculation →
  // "+ Ajouter un bloc"), sans slot connu à l'avance : sans cette liste, un
  // tel bloc n'apparaîtrait nulle part sur cette page (même bug que sur
  // /natation, corrigé le même jour).
  const knownSlots = new Set(Object.keys(DEFAULT_SECTIONS));
  const extraBlocks = (cmsBlocks ?? []).filter((b) => !b.slot || !knownSlots.has(b.slot));

  return (
    <Suspense fallback={null}>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <EnsureCmsBlocks slug="musculation" blocks={missingSlots} />
        <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">Musculation</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-8">
            {[CRENEAUX_SLOT, ENCADRANTS_SLOT, GARDIEN_SLOT, CONDITIONS_SLOT]
              .filter((slot) => !hiddenSlots.has(slot))
              .map((slot) => (
                <TextSection key={slot} slot={slot} block={blockBySlot.get(slot)} />
              ))}
          </div>

          <div>
            <div className="rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm">
              <TextSection
                slot={DECHARGE_SLOT}
                block={dechargeBlock}
                bodyClassName="mt-2 block space-y-3 whitespace-pre-line text-sm text-toac-blue-900/80"
              />
              <div className="mt-6">
                <MusculationDechargeForm />
              </div>
            </div>
          </div>
        </div>

        {extraBlocks.length > 0 && (
          <div className="mt-10 space-y-8">
            {extraBlocks.map((block) =>
              block.block_type === "accordion" ? (
                <AccordionBlock key={block.id} block={block} />
              ) : (
                <section
                  key={block.id}
                  id={block.anchor || slugify(block.heading) || block.id}
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
              )
            )}
          </div>
        )}
        <div className="mt-8">
          <CmsAddTile payload={{ type: "add-block" }} label="+ Ajouter un bloc" />
        </div>
      </div>
    </Suspense>
  );
}
