import type { Metadata } from "next";
import { Suspense } from "react";
import SiteImage from "@/components/SiteImage";
import { CmsEditableText, CmsEditableImage, CmsEditPencil, CmsAddTile } from "@/components/cms-edit";
import EnsureCmsBlocks, { type EnsureBlockSpec } from "@/components/EnsureCmsBlocks";
import { slugify } from "@/lib/slug";
import { getCmsCatalog, getCmsPageBlocks, getCmsHiddenBlocks } from "@/lib/cms";
import { PALMARES_2025 } from "@/content/bureau";

export const metadata: Metadata = {
  title: "Le Club — À propos",
  description:
    "Le TOAC Triathlon, né en 1992, est aujourd'hui un club indépendant de ~180 licenciés à Toulouse, tous niveaux, affilié FFTRI.",
};

// Titre du palmarès : bloc "à emplacement fixe" (même convention que la page
// Triathlons du Lauragais) identifié par un slot technique stable, pour
// rester modifiable en ligne même si son texte affiché est renommé.
const PALMARES_TITLE_SLOT = "palmares-title";
const PALMARES_TITLE_LEGACY = "Ils portent nos couleurs — Palmarès 2025";

// La rubrique catalogue a été renommée "Champions TOAC" (ex "Palmarès 2025") :
// on reconnaît encore l'ancien nom tant qu'un admin n'a pas renommé la
// rubrique depuis Dashboard → Catalogue.
const CHAMPIONS_SECTION_NAME = "Champions TOAC";
const CHAMPIONS_SECTION_LEGACY_NAME = "Palmarès 2025";

export default async function LeClubPage() {
  const [cmsCatalog, cmsBlocks, hiddenBlocks] = await Promise.all([
    getCmsCatalog(),
    getCmsPageBlocks("le-club"),
    getCmsHiddenBlocks("le-club"),
  ]);
  const palmaresSection =
    cmsCatalog?.find((s) => s.name === CHAMPIONS_SECTION_NAME) ??
    cmsCatalog?.find((s) => s.name === CHAMPIONS_SECTION_LEGACY_NAME);

  const palmaresTitleBlock =
    cmsBlocks?.find((b) => b.slot === PALMARES_TITLE_SLOT) ??
    cmsBlocks?.find((b) => !b.slot && b.heading === PALMARES_TITLE_LEGACY);
  const palmaresTitleHidden = hiddenBlocks.some(
    (b) => b.slot === PALMARES_TITLE_SLOT || (!b.slot && b.heading === PALMARES_TITLE_LEGACY)
  );

  const missingSlots: EnsureBlockSpec[] = [
    !palmaresTitleBlock &&
      !palmaresTitleHidden && {
        slot: PALMARES_TITLE_SLOT,
        heading: PALMARES_TITLE_LEGACY,
        body: "",
      },
  ].filter((spec): spec is EnsureBlockSpec => Boolean(spec));

  // Blocs libres de "Notre histoire" : tous les blocs CMS de la page, à
  // l'exception du titre du palmarès ci-dessus (qui a son propre emplacement
  // fixe et ne doit pas être affiché une seconde fois dans cette liste).
  const histoireBlocks = cmsBlocks?.filter((b) => b.id !== palmaresTitleBlock?.id) ?? null;
  // S'il ne reste que le bloc "titre du palmarès" (ou aucun bloc du tout), on
  // considère que "Notre histoire" n'a jamais été personnalisée et on garde le
  // texte par défaut du code — sans ça, le simple fait d'ouvrir cette page
  // dans le dashboard (qui crée automatiquement le bloc du titre) ferait
  // disparaître "Notre histoire" au profit d'une section vide.
  const showHistoireFallback = !cmsBlocks || (cmsBlocks.length > 0 && histoireBlocks?.length === 0);

  return (
    <Suspense fallback={null}>
    <>
      <EnsureCmsBlocks blocks={missingSlots} />
      <section className="relative flex h-[45vh] items-end bg-toac-blue-950 text-white">
        <SiteImage name="hero-le-club" label="Photo — groupe TOAC" priority className="absolute inset-0 h-full w-full opacity-50" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl uppercase sm:text-5xl">Le Club</h1>
        </div>
      </section>

      {showHistoireFallback ? (
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950">
            Notre histoire
          </h2>
          <div className="mt-6 space-y-4 text-toac-blue-900/90">
            <p>
              Le TOAC Triathlon est né en 1992 comme section du Toulouse Olympique Aérospatiale Club. C'est
              aujourd'hui une association sportive indépendante, toujours soutenue par le TOAC.
            </p>
            <p>
              Le club connaît une croissance constante et maîtrisée depuis 2021, avec aujourd'hui environ 180
              licenciés. Son siège se situe au 20 chemin de Garric, 31200 Toulouse.
            </p>
            <p>
              L'esprit du club est convivial et ouvert à tous les niveaux, du débutant au compétiteur, du XS au
              XXL. Le TOAC participe aux challenges de Division 3 (D3) de triathlon et duathlon.
            </p>
            <div className="rounded-md border border-toac-pink-500/40 bg-toac-pink-300/10 p-4 text-sm">
              <strong>À noter :</strong> le club n'a pas de section jeunes ni d'école de triathlon. Les jeunes
              peuvent se tourner vers l'AS Muret Triathlon, le TUC Triathlon ou le Toulouse Triathlon Métropole.
            </div>
          </div>
        </section>
      ) : (
        histoireBlocks!.map((block) => (
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
        ))
      )}
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <CmsAddTile payload={{ type: "add-block" }} label="+ Ajouter un bloc de contenu sur cette page" />
      </div>

      <section className="bg-toac-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {palmaresTitleBlock ? (
            <div className="relative inline-block pr-9">
              <CmsEditPencil
                payload={{ type: "edit-block", blockId: palmaresTitleBlock.id }}
                className="absolute right-0 top-0"
              />
              <CmsEditableText
                as="h2"
                value={palmaresTitleBlock.heading}
                target={{ kind: "block", id: palmaresTitleBlock.id, field: "heading" }}
                className="section-title font-display text-2xl uppercase text-toac-blue-950"
              />
            </div>
          ) : (
            !palmaresTitleHidden && (
              <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950">
                {PALMARES_TITLE_LEGACY}
              </h2>
            )
          )}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {palmaresSection
              ? palmaresSection.products.map((p) => (
                  <div
                    key={p.id}
                    className="relative flex items-center gap-4 rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm"
                  >
                    <CmsEditableImage
                      src={p.image_url}
                      alt={p.name}
                      target={{ kind: "product", id: p.id }}
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-toac-gray-200"
                      imgClassName="h-14 w-14 rounded-full object-cover"
                      zoomable
                    />
                    <div>
                      <CmsEditableText
                        as="div"
                        value={p.name}
                        target={{ kind: "product", id: p.id, field: "name" }}
                        className="font-display text-base uppercase text-toac-blue-950"
                      />
                      <CmsEditableText
                        as="div"
                        value={p.description}
                        target={{ kind: "product", id: p.id, field: "description" }}
                        multiline
                        className="mt-1 block text-sm text-toac-blue-900/70"
                      />
                    </div>
                  </div>
                ))
              : PALMARES_2025.map((p) => (
                  <div key={p.name} className="flex items-center gap-4 rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
                    <SiteImage
                      name={`palmares-${slugify(p.name)}`}
                      label={p.name}
                      className="h-14 w-14 shrink-0 rounded-full"
                      zoomable
                    />
                    <div>
                      <div className="font-display text-base uppercase text-toac-blue-950">{p.name}</div>
                      <div className="mt-1 text-sm text-toac-blue-900/70">{p.exploit}</div>
                    </div>
                  </div>
                ))}
            <CmsAddTile
              payload={{ type: "add-product", sectionId: palmaresSection?.id }}
              label="+ Ajouter un palmarès"
            />
          </div>
        </div>
      </section>
    </>
    </Suspense>
  );
}
