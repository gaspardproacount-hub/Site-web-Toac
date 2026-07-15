import type { Metadata } from "next";
import { Suspense } from "react";
import SiteImage from "@/components/SiteImage";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";

export const metadata: Metadata = {
  title: "Triathlons du Lauragais",
  description:
    "15e édition des Triathlons du Lauragais, les 6 et 7 juin 2026 à Nailloux. XS, S, M, L, swimrun et épreuves jeunes.",
};

const FORMATS = ["XS", "S", "M", "L", "Swimrun (SR)", "Jeunes 6-9 ans", "Jeunes 10-13 ans"];

export default function TriathlonsDuLauragaisPage() {
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
          <span className="font-display text-sm uppercase tracking-wide text-toac-pink-400">
            15e édition
          </span>
          <h1 className="mt-2 font-display text-4xl uppercase leading-tight sm:text-5xl">
            Triathlons du Lauragais
          </h1>
          <p className="mt-3 text-lg">6-7 juin 2026 — Nailloux</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#" // URL_INSCRIPTION_TDL — à compléter
              className="rounded-md bg-toac-pink-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400"
            >
              S'inscrire à la course
            </a>
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
        <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950">
          Objectif : 1 200 coureurs
        </h2>
        <p className="mt-4 text-toac-blue-900/90">
          Deux jours de course dans une ambiance chaleureuse et festive à l'image du club, ouverts à tous du
          débutant au champion, en individuel, duo ou relais.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {FORMATS.map((f) => (
            <span key={f} className="rounded-full border border-toac-blue-600 px-4 py-1.5 text-sm font-medium text-toac-blue-700">
              {f}
            </span>
          ))}
        </div>
        <p className="mt-6 rounded-md border border-toac-pink-500/40 bg-toac-pink-300/10 p-4 text-sm text-toac-blue-900">
          Épreuve support du challenge régional D3 (Nailloux, 6 juin).
        </p>
      </section>

      <div className="bg-toac-gray-50">
        <CmsPageBlocks
          slug="triathlons-du-lauragais"
          fallback={
            <section className="py-16">
              <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950">
                  180 bénévoles nécessaires
                </h2>
                <p className="mt-4 text-toac-blue-900/90">
                  L'organisation mobilise 180 bénévoles sur 4 jours : installation le vendredi, course le week-end,
                  derniers retours le lundi. Cet événement finance la vie du club (sortie club, cadeaux adhérents,
                  D3, investissements).
                </p>
              </div>
            </section>
          }
        />
      </div>
    </>
    </Suspense>
  );
}
