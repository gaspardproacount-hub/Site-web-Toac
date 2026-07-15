import type { Metadata } from "next";
import { Suspense } from "react";
import {
  PLANNING,
  CRENEAUX_LIBRES,
  DISCIPLINE_LABELS,
  DISCIPLINE_COLORS,
  JOURS_ORDER,
} from "@/content/planning";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";

export const metadata: Metadata = {
  title: "Planning des entraînements",
  description:
    "Planning hebdomadaire des entraînements du TOAC Triathlon : natation, vélo, course à pied, musculation.",
};

export default function EntrainementsPage() {
  const parJour = JOURS_ORDER.map((jour) => ({
    jour,
    creneaux: PLANNING.filter((c) => c.jour === jour),
  })).filter((g) => g.creneaux.length > 0);

  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
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

      <div className="mt-8 flex flex-wrap gap-3 text-xs">
        {(Object.keys(DISCIPLINE_LABELS) as Array<keyof typeof DISCIPLINE_LABELS>).map((d) => (
          <span key={d} className={`rounded-full border px-3 py-1 font-medium ${DISCIPLINE_COLORS[d]}`}>
            {DISCIPLINE_LABELS[d]}
          </span>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {parJour.map((g) => (
          <div key={g.jour} className="rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg uppercase text-toac-blue-950">{g.jour}</h2>
            <ul className="mt-3 space-y-3">
              {g.creneaux.map((c, i) => (
                <li key={i} className="flex flex-col gap-1 border-b border-toac-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-toac-blue-950">{c.heure}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${DISCIPLINE_COLORS[c.discipline]}`}>
                      {DISCIPLINE_LABELS[c.discipline]}
                    </span>
                  </div>
                  <span className="text-sm text-toac-blue-900/80">{c.lieu}</span>
                  {c.detail && <span className="text-xs text-toac-blue-900/60">{c.detail}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-md border border-toac-pink-500/40 bg-toac-pink-300/10 p-5 text-sm text-toac-blue-900">
        <strong>Casque strictement obligatoire</strong> en sortie vélo — le coach peut refuser un adhérent si
        la sécurité du groupe est en jeu. La musculation nécessite une décharge signée, téléchargeable dans
        l'espace adhérents.
      </div>

      <h2 className="mt-14 font-display text-xl uppercase text-toac-blue-950">
        Entraînement libre (non encadré)
      </h2>
      <ul className="mt-4 space-y-3">
        {CRENEAUX_LIBRES.map((c, i) => (
          <li key={i} className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
            <div className="font-medium text-toac-blue-950">{c.lieu}</div>
            <div className="text-sm text-toac-blue-900/70">{c.detail}</div>
          </li>
        ))}
      </ul>
    </div>
    </Suspense>
  );
}
