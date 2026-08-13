import type { Metadata } from "next";
import { Suspense } from "react";
import SiteImage from "@/components/SiteImage";
import { CmsEditableText, CmsEditableImage, CmsEditPencil, CmsAddTile } from "@/components/cms-edit";
import AddToCalendarButton from "@/components/AddToCalendarButton";
import { getCmsPageBlocks, getCmsCatalog } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Triathlons du Lauragais",
  description:
    "15e édition des Triathlons du Lauragais, les 6 et 7 juin 2026 à Nailloux. XS, S, M, L, swimrun et épreuves jeunes.",
};

const FORMATS = ["XS", "S", "M", "L", "Swimrun (SR)", "Jeunes 6-9 ans", "Jeunes 10-13 ans"];

export default async function TriathlonsDuLauragaisPage() {
  const [cmsBlocks, cmsCatalog] = await Promise.all([
    getCmsPageBlocks("triathlons-du-lauragais"),
    getCmsCatalog(),
  ]);
  // Les blocs "à emplacement fixe" sont identifiés par un identifiant
  // technique stable (slot), invisible sur le site — pas par leur titre
  // affiché, qui peut être renommé sans casser le lien avec cet emplacement.
  // Repli sur l'ancien titre exact pour les blocs créés avant l'existence du
  // slot (pas encore migrés).
  function findSlot(slot: string, legacyHeading: string) {
    return (
      cmsBlocks?.find((b) => b.slot === slot) ??
      cmsBlocks?.find((b) => !b.slot && b.heading === legacyHeading)
    );
  }
  const heroBlock = findSlot("hero", "Triathlons du Lauragais");
  const objectifBlock = findSlot("objectif", "Objectif : 1 200 coureurs");
  // Bloc sans titre visible sur le site (le champ "titre" ne sert qu'à le
  // retrouver dans le dashboard) : le texte du bandeau rose "Épreuve support…".
  const noticeBlock = findSlot("notice", "Notice D3");
  // Idem : le champ "titre" n'est qu'un identifiant technique, seul le corps
  // ("15e édition") s'affiche, au-dessus du titre principal.
  const editionBlock = findSlot("edition", "Édition Triathlons du Lauragais");
  const formatsSection = cmsCatalog?.find((s) => s.name === "Formats Triathlons du Lauragais");
  // Blocs ajoutés librement par le client via "+ Ajouter un bloc de contenu"
  // (ni le hero, ni l'objectif, ni la notice D3, ni l'édition) : affichés tels
  // quels, dans l'ordre choisi dans le dashboard. C'est le cas notamment du
  // bloc "bénévoles", entièrement géré par le client depuis le CMS (plus de
  // texte par défaut codé en dur pour cette section).
  const knownBlockIds = new Set(
    [heroBlock, objectifBlock, noticeBlock, editionBlock].filter(Boolean).map((b) => b!.id)
  );
  const extraBlocks = cmsBlocks?.filter((b) => !knownBlockIds.has(b.id)) ?? [];

  const makeEditableTileClassName =
    "text-xs font-medium text-toac-pink-300 underline decoration-dotted underline-offset-2 hover:text-toac-pink-200";
  const makeEditableTileClassNameLight =
    "text-xs font-medium text-toac-blue-700 underline decoration-dotted underline-offset-2 hover:text-toac-pink-500";

  return (
    <Suspense fallback={null}>
    <>
      <section className="relative flex min-h-[60vh] items-end bg-toac-blue-950 text-white">
        <SiteImage
          name="hero-triathlons-lauragais"
          label="Photo — Triathlons du Lauragais, ligne d'arrivée"
          priority
          className="absolute inset-0 h-full w-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-toac-blue-950 via-toac-blue-950/40 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
          {editionBlock ? (
            <div className="relative inline-block pr-8">
              <CmsEditPencil
                payload={{ type: "edit-block", blockId: editionBlock.id }}
                className="absolute -right-1 -top-1 h-5 w-5 text-[9px]"
              />
              <CmsEditableText
                as="span"
                value={editionBlock.body || "15e édition"}
                target={{ kind: "block", id: editionBlock.id, field: "body" }}
                className="font-display text-sm uppercase tracking-wide text-toac-pink-400"
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display text-sm uppercase tracking-wide text-toac-pink-400">
                15e édition
              </span>
              <CmsAddTile
                payload={{
                  type: "add-block",
                  slot: "edition",
                  heading: "Édition Triathlons du Lauragais",
                  body: "15e édition",
                }}
                label="+ Rendre modifiable"
                className={makeEditableTileClassName}
              />
            </div>
          )}
          {heroBlock ? (
            <div className="relative pr-9">
              <CmsEditPencil
                payload={{ type: "edit-block", blockId: heroBlock.id }}
                className="absolute right-0 top-0"
              />
              <CmsEditableText
                as="h1"
                value={heroBlock.heading}
                target={{ kind: "block", id: heroBlock.id, field: "heading" }}
                className="mt-2 block font-display text-4xl uppercase leading-tight sm:text-5xl"
              />
              <CmsEditableText
                as="p"
                value={heroBlock.body || "6-7 juin 2026 — Nailloux"}
                target={{ kind: "block", id: heroBlock.id, field: "body" }}
                className="mt-3 block text-lg"
              />
            </div>
          ) : (
            <>
              <h1 className="mt-2 font-display text-4xl uppercase leading-tight sm:text-5xl">
                Triathlons du Lauragais
              </h1>
              <p className="mt-3 text-lg">6-7 juin 2026 — Nailloux</p>
              <CmsAddTile
                payload={{
                  type: "add-block",
                  slot: "hero",
                  heading: "Triathlons du Lauragais",
                  body: "6-7 juin 2026 — Nailloux",
                }}
                label="+ Rendre le titre et la date modifiables"
                className={`mt-2 ${makeEditableTileClassName}`}
              />
            </>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <AddToCalendarButton
              title="Triathlons du Lauragais"
              description="15e édition des Triathlons du Lauragais, à Nailloux. XS, S, M, L, swimrun et épreuves jeunes."
              location="Nailloux"
              startDate="20260606"
              endDate="20260607"
            />
            <a
              href="https://www.instagram.com/triathlonsdulauragais"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border-2 border-white px-6 py-3 font-display text-sm uppercase tracking-wide text-white transition hover:bg-white hover:text-toac-blue-950"
            >
              Instagram @triathlonsdulauragais
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {objectifBlock ? (
          <div className="relative pr-9">
            <CmsEditPencil
              payload={{ type: "edit-block", blockId: objectifBlock.id }}
              className="absolute right-0 top-0"
            />
            <CmsEditableText
              as="h2"
              value={objectifBlock.heading}
              target={{ kind: "block", id: objectifBlock.id, field: "heading" }}
              className="section-title font-display text-2xl uppercase text-toac-blue-950"
            />
            <CmsEditableText
              as="p"
              value={objectifBlock.body}
              target={{ kind: "block", id: objectifBlock.id, field: "body" }}
              multiline
              className="mt-4 block text-toac-blue-900/90"
            />
          </div>
        ) : (
          <>
            <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950">
              Objectif : 1 200 coureurs
            </h2>
            <p className="mt-4 text-toac-blue-900/90">
              Deux jours de course dans une ambiance chaleureuse et festive à l'image du club, ouverts à tous du
              débutant au champion, en individuel, duo ou relais.
            </p>
            <CmsAddTile
              payload={{
                type: "add-block",
                slot: "objectif",
                heading: "Objectif : 1 200 coureurs",
                body: "Deux jours de course dans une ambiance chaleureuse et festive à l'image du club, ouverts à tous du débutant au champion, en individuel, duo ou relais.",
              }}
              label="+ Rendre ce bloc modifiable"
              className={`mt-2 ${makeEditableTileClassNameLight}`}
            />
          </>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {formatsSection
            ? formatsSection.products.map((f) => (
                <CmsEditableText
                  key={f.id}
                  as="span"
                  value={f.name}
                  target={{ kind: "product", id: f.id, field: "name" }}
                  className="rounded-full border border-toac-blue-600 px-4 py-1.5 text-sm font-medium text-toac-blue-700"
                />
              ))
            : FORMATS.map((f) => (
                <span key={f} className="rounded-full border border-toac-blue-600 px-4 py-1.5 text-sm font-medium text-toac-blue-700">
                  {f}
                </span>
              ))}
          <CmsAddTile
            payload={{ type: "add-product", sectionId: formatsSection?.id }}
            label="+ Ajouter un format"
          />
        </div>
        {noticeBlock ? (
          <div className="relative mt-6 pr-9">
            <CmsEditPencil
              payload={{ type: "edit-block", blockId: noticeBlock.id }}
              className="absolute right-0 top-0"
            />
            <CmsEditableText
              as="p"
              value={noticeBlock.body}
              target={{ kind: "block", id: noticeBlock.id, field: "body" }}
              multiline
              className="block rounded-md border border-toac-pink-500/40 bg-toac-pink-300/10 p-4 text-sm text-toac-blue-900"
            />
          </div>
        ) : (
          <div className="mt-6">
            <p className="rounded-md border border-toac-pink-500/40 bg-toac-pink-300/10 p-4 text-sm text-toac-blue-900">
              Épreuve support du challenge régional D3 (Nailloux, 6 juin).
            </p>
            <CmsAddTile
              payload={{
                type: "add-block",
                slot: "notice",
                heading: "Notice D3",
                body: "Épreuve support du challenge régional D3 (Nailloux, 6 juin).",
              }}
              label="+ Rendre ce bloc modifiable"
              className={`mt-2 ${makeEditableTileClassNameLight}`}
            />
          </div>
        )}
      </section>

      <div className="bg-toac-gray-50">
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {extraBlocks.map((block, index) => (
              <div key={block.id} className={`relative pr-9 ${index > 0 ? "mt-12" : ""}`}>
                <CmsEditPencil
                  payload={{ type: "edit-block", blockId: block.id }}
                  className="absolute right-0 top-0"
                />
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
                    as="p"
                    value={block.body}
                    target={{ kind: "block", id: block.id, field: "body" }}
                    multiline
                    className="mt-4 block text-toac-blue-900/90"
                  />
                )}
              </div>
            ))}
            <CmsAddTile
              payload={{ type: "add-block" }}
              label="+ Ajouter un bloc de contenu sur cette page"
            />

          </div>
        </section>
      </div>
    </>
    </Suspense>
  );
}
