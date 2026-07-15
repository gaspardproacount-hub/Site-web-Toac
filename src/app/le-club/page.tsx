import type { Metadata } from "next";
import { Suspense } from "react";
import SiteImage from "@/components/SiteImage";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";
import { PALMARES_2025 } from "@/content/bureau";

export const metadata: Metadata = {
  title: "Le Club — À propos",
  description:
    "Le TOAC Triathlon, né en 1992, est aujourd'hui un club indépendant de ~180 licenciés à Toulouse, tous niveaux, affilié FFTRI.",
};

export default function LeClubPage() {
  return (
    <Suspense fallback={null}>
    <>
      <section className="relative flex h-[45vh] items-end bg-toac-blue-950 text-white">
        <SiteImage name="hero-le-club" label="Photo — groupe TOAC" priority className="absolute inset-0 h-full w-full opacity-50" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl uppercase sm:text-5xl">Le Club</h1>
        </div>
      </section>

      <CmsPageBlocks
        slug="le-club"
        fallback={
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
        }
      />

      <section className="bg-toac-gray-50 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950">
            Ils portent nos couleurs — Palmarès 2025
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PALMARES_2025.map((p) => (
              <div key={p.name} className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
                <div className="font-display text-base uppercase text-toac-blue-950">{p.name}</div>
                <div className="mt-1 text-sm text-toac-blue-900/70">{p.exploit}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
    </Suspense>
  );
}
