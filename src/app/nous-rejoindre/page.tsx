import type { Metadata } from "next";
import { Suspense } from "react";
import { getCmsPageBlocks } from "@/lib/cms";
import { CmsEditableText, CmsAddTile } from "@/components/cms-edit";
import EtapeAccordionItem from "@/components/EtapeAccordionItem";
import TarifsAccordion from "@/components/TarifsAccordion";

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
  const [cmsBlocks, tarifsBlocks] = await Promise.all([
    getCmsPageBlocks("nous-rejoindre"),
    getCmsPageBlocks("nous-rejoindre-tarifs"),
  ]);
  // Le 1er bloc sert de titre/intro, les suivants sont les étapes numérotées.
  const introBlock = cmsBlocks?.[0];
  const etapeBlocks = cmsBlocks?.slice(1) ?? [];
  const tarifsBlock = tarifsBlocks?.[0];

  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
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

      <div className="mt-10">
        <TarifsAccordion block={tarifsBlock} />
      </div>

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
