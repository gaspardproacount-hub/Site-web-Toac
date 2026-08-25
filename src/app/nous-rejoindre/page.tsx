import type { Metadata } from "next";
import { Suspense } from "react";
import { getCmsPageBlocks, getCmsHiddenBlocks } from "@/lib/cms";
import { CmsEditableText, CmsAddTile } from "@/components/cms-edit";
import EtapeAccordionItem from "@/components/EtapeAccordionItem";
import TarifsAccordion, { TARIFS_SLOT, DEFAULT_HEADING as TARIFS_HEADING, DEFAULT_BODY as TARIFS_BODY } from "@/components/TarifsAccordion";
import EnsureCmsBlocks, { type EnsureBlockSpec } from "@/components/EnsureCmsBlocks";

export const metadata: Metadata = {
  title: "Nous rejoindre",
  description: "Adhérer au TOAC Triathlon : parcours d'adhésion et pré-inscription en ligne.",
};

const ETAPES = [
  "Remplir le formulaire d'adhésion et payer en ligne (cotisation + caution, paiement sécurisé Monetico)",
  "Demande de licence FFTRI",
  "Rejoindre les listes Google et la communauté WhatsApp du club",
  "Commander sa trifonction TOAC",
];

export default async function NousRejoindrePage() {
  const [cmsBlocks, hiddenBlocks] = await Promise.all([
    getCmsPageBlocks("nous-rejoindre"),
    getCmsHiddenBlocks("nous-rejoindre"),
  ]);

  // Le bloc Tarifs a son propre emplacement fixe (comme le titre "Le club en
  // 3 temps" sur l'accueil) et ne doit pas compter dans l'indexation
  // positionnelle ci-dessous (intro, étapes), qui reste par position pour ne
  // pas casser les blocs existants. On exclut TOUS les blocs correspondants
  // (pas juste le premier trouvé) : en cas de doublon créé par une création
  // concurrente (cache de 60s sur getCmsPageBlocks, deux aperçus ouverts
  // avant que le premier bloc créé ne soit visible), les doublons restent en
  // base mais n'apparaissent plus comme fausses étapes.
  const tarifsMatches =
    cmsBlocks?.filter((b) => b.slot === TARIFS_SLOT || (!b.slot && b.heading === TARIFS_HEADING)) ?? [];
  const tarifsBlock = tarifsMatches.at(0);
  const tarifsHidden = hiddenBlocks.some(
    (b) => b.slot === TARIFS_SLOT || (!b.slot && b.heading === TARIFS_HEADING)
  );
  const positionalBlocks = cmsBlocks?.filter((b) => !tarifsMatches.some((m) => m.id === b.id)) ?? cmsBlocks;

  // Le 1er bloc sert de titre/intro, les suivants sont les étapes numérotées.
  const introBlock = positionalBlocks?.[0];
  const etapeBlocks = positionalBlocks?.slice(1) ?? [];

  // Emplacement fixe pas encore créé dans le CMS : créé automatiquement (sans
  // clic) dès l'ouverture de l'aperçu dans le dashboard.
  const missingSlots: EnsureBlockSpec[] = [
    !tarifsBlock &&
      !tarifsHidden && {
        slot: TARIFS_SLOT,
        heading: TARIFS_HEADING,
        body: TARIFS_BODY,
      },
  ].filter((spec): spec is EnsureBlockSpec => Boolean(spec));

  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <EnsureCmsBlocks blocks={missingSlots} />
      {introBlock ? (
        <>
          <CmsEditableText
            as="h1"
            value={introBlock.heading || "Nous rejoindre"}
            target={{ kind: "block", id: introBlock.id, field: "heading" }}
            className="section-title font-display text-3xl uppercase text-toac-blue-950"
          />
          <CmsEditableText
            as="p"
            value={
              introBlock.body ||
              "Nouvelles adhésions : merci de prendre contact avec le bureau avant de finaliser votre inscription."
            }
            target={{ kind: "block", id: introBlock.id, field: "body" }}
            multiline
            className="mt-4 block text-toac-blue-900/80"
          />
        </>
      ) : (
        <>
          <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
            Nous rejoindre
          </h1>
          <p className="mt-4 text-toac-blue-900/80">
            Nouvelles adhésions : merci de prendre contact avec le bureau avant de finaliser votre inscription.
          </p>
        </>
      )}

      {!tarifsHidden && (
        <div className="mt-10">
          <TarifsAccordion block={tarifsBlock} />
        </div>
      )}

      <ol className="mt-4 space-y-4">
        {etapeBlocks.length
          ? etapeBlocks.map((block, i) => (
              <EtapeAccordionItem key={block.id} index={i} block={block} />
            ))
          : ETAPES.map((etape, i) => (
              <li key={etape} className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-toac-blue-950 font-display text-sm text-toac-pink-400">
                  {i + 1}
                </span>
                <span className="pt-1 text-toac-blue-900/90">{etape}</span>
              </li>
            ))}
        <li>
          <CmsAddTile payload={{ type: "add-block" }} label="+ Ajouter une étape" />
        </li>
      </ol>
    </div>
    </Suspense>
  );
}
