import type { Metadata } from "next";
import { Suspense } from "react";
import { PLANNING, DISCIPLINE_LABELS, DISCIPLINE_COLORS } from "@/content/planning";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";
import { CmsEditableText, CmsAddTile, CmsEditPencil } from "@/components/cms-edit";
import { getCmsCatalog, getCmsPageBlocks, getCmsHiddenBlocks, getCmsTrainingSessions } from "@/lib/cms";
import EnsureCmsBlocks, { type EnsureBlockSpec } from "@/components/EnsureCmsBlocks";
import EntrainementsPlanning, { type PlanningSession } from "@/components/EntrainementsPlanning";

const JOUR_LABEL_BY_CMS_DAY: Record<string, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

// Parse les heures au format du fallback statique ("7h00", "12h20").
function heureToMinutes(heure: string): number {
  const match = heure.match(/(\d{1,2})h(\d{0,2})/);
  if (!match) return 0;
  const h = parseInt(match[1], 10) || 0;
  const m = parseInt(match[2], 10) || 0;
  return h * 60 + m;
}

const DEFAULT_SESSION_DURATION = 60;

export const metadata: Metadata = {
  title: "Planning des entraînements",
  description:
    "Planning hebdomadaire des entraînements du TOAC Triathlon : natation, vélo, course à pied, musculation.",
};

const PLANNING_PREFIX = "Planning – ";
const DEFAULT_CRENEAU_COLOR = "bg-toac-gray-100 text-toac-blue-900 border-toac-gray-200";

function guessCreneauColor(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("natation")) return DISCIPLINE_COLORS.natation;
  if (t.includes("vélo") || t.includes("velo")) return DISCIPLINE_COLORS.velo;
  if (t.includes("course")) return DISCIPLINE_COLORS.course;
  if (t.includes("muscu")) return DISCIPLINE_COLORS.muscu;
  return DEFAULT_CRENEAU_COLOR;
}

const NOTICE_SLOT = "entrainements-notice";
const DEFAULT_NOTICE =
  "**Casque strictement obligatoire** en sortie vélo — le coach peut refuser un adhérent si la sécurité " +
  "du groupe est en jeu. La musculation nécessite une décharge signée, téléchargeable dans l'espace adhérents.";

export default async function EntrainementsPage() {
  const [cmsCatalog, pageBlocks, hiddenBlocks, cmsTrainingSessions] = await Promise.all([
    getCmsCatalog(),
    getCmsPageBlocks("entrainements"),
    getCmsHiddenBlocks("entrainements"),
    getCmsTrainingSessions(),
  ]);
  const noticeBlock = pageBlocks?.find((b) => b.slot === NOTICE_SLOT);
  const noticeHidden = hiddenBlocks.some((b) => b.slot === NOTICE_SLOT);
  const missingSlots: EnsureBlockSpec[] = [
    !noticeBlock &&
      !noticeHidden && {
        slot: NOTICE_SLOT,
        heading: "",
        body: DEFAULT_NOTICE,
      },
  ].filter((spec): spec is EnsureBlockSpec => Boolean(spec));
  const planningSections = cmsCatalog?.filter((s) => s.name.startsWith(PLANNING_PREFIX)) ?? [];
  const cmsJours = planningSections.filter((s) => s.name.slice(PLANNING_PREFIX.length) !== "Libre");

  // Le planning structuré (dashboard → Planning) est prioritaire. À défaut,
  // et seulement si les anciennes rubriques catalogue "Planning – <Jour>"
  // n'existent pas non plus, on retombe sur le planning statique du code —
  // dans le même format de grille/filtres, pour ne pas perdre la fonctionnalité
  // tant que le club n'a pas migré son planning vers le CMS.
  const planningSessions: PlanningSession[] = cmsTrainingSessions
    ? cmsTrainingSessions.map((s) => {
        const start = timeToMinutes(s.start_time);
        const end = s.end_time ? timeToMinutes(s.end_time) : start + DEFAULT_SESSION_DURATION;
        return {
          id: s.id,
          jour: JOUR_LABEL_BY_CMS_DAY[s.day] ?? s.day,
          startMinutes: start,
          endMinutes: end,
          hasEndTime: Boolean(s.end_time),
          sport: s.sport,
          lieu: s.location,
          coach: s.coach,
          notes: s.notes,
        };
      })
    : !cmsJours.length
      ? PLANNING.map((c, i) => {
          const start = heureToMinutes(c.heure);
          return {
            id: `static-${i}`,
            jour: c.jour,
            startMinutes: start,
            endMinutes: start + DEFAULT_SESSION_DURATION,
            hasEndTime: false,
            sport: c.discipline,
            lieu: c.lieu,
            coach: "",
            notes: c.detail ?? "",
          };
        })
      : [];

  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <EnsureCmsBlocks slug="entrainements" blocks={missingSlots} />
      <CmsPageBlocks
        slug="entrainements"
        fallback={
          <>
            <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
              Planning de la semaine
            </h1>
            <p className="mt-4 max-w-3xl text-toac-blue-900/80">
              Retrouvez toutes les séances encadrées du club sur l'application <strong>IDO</strong>, qui regroupe
              horaires, lieux et contenus. Le planning ci-dessous est celui de la saison en cours.
            </p>
          </>
        }
      />

      {planningSessions.length ? (
        <EntrainementsPlanning sessions={planningSessions} />
      ) : (
        <>
          <div className="mt-8 flex flex-wrap gap-3 text-xs">
            {(Object.keys(DISCIPLINE_LABELS) as Array<keyof typeof DISCIPLINE_LABELS>).map((d) => (
              <span key={d} className={`rounded-full border px-3 py-1 font-medium ${DISCIPLINE_COLORS[d]}`}>
                {DISCIPLINE_LABELS[d]}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {cmsJours.map((section) => {
              const jour = section.name.slice(PLANNING_PREFIX.length);
              return (
                <div key={section.id} className="rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="font-display text-lg uppercase text-toac-blue-950">{jour}</h2>
                  <ul className="mt-3 space-y-3">
                    {section.products.map((c) => (
                      <li
                        key={c.id}
                        className="relative flex flex-col gap-1 border-b border-toac-gray-100 pb-3 pr-9 last:border-0 last:pb-0"
                      >
                        <CmsEditPencil
                          payload={{ type: "edit-product", productId: c.id }}
                          className="absolute right-0 top-0 h-6 w-6 text-[10px]"
                        />
                        <CmsEditableText
                          as="div"
                          value={c.name}
                          target={{ kind: "product", id: c.id, field: "name" }}
                          className={`inline-block w-fit rounded-full border px-2 py-0.5 text-xs font-medium ${guessCreneauColor(c.name)}`}
                        />
                        <CmsEditableText
                          as="div"
                          value={c.description}
                          target={{ kind: "product", id: c.id, field: "description" }}
                          multiline
                          className="mt-1 block whitespace-pre-line text-sm text-toac-blue-900/80"
                        />
                      </li>
                    ))}
                    <li>
                      <CmsAddTile payload={{ type: "add-product", sectionId: section.id }} label="+ Ajouter un créneau" />
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </>
      )}

      {!noticeHidden && (
        <div className="relative mt-10 rounded-md border border-toac-pink-500/40 bg-toac-pink-300/10 p-5 pr-10 text-sm text-toac-blue-900">
          {noticeBlock && (
            <CmsEditPencil
              payload={{ type: "edit-block", blockId: noticeBlock.id }}
              className="absolute right-2 top-2"
            />
          )}
          {noticeBlock ? (
            <CmsEditableText
              as="div"
              value={noticeBlock.body || DEFAULT_NOTICE}
              target={{ kind: "block", id: noticeBlock.id, field: "body" }}
              multiline
            />
          ) : (
            <>
              <strong>Casque strictement obligatoire</strong> en sortie vélo — le coach peut refuser un
              adhérent si la sécurité du groupe est en jeu. La musculation nécessite une décharge signée,
              téléchargeable dans l&apos;espace adhérents.
            </>
          )}
        </div>
      )}
    </div>
    </Suspense>
  );
}
