import type { Metadata } from "next";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { BUREAU_2026, PRESIDENT_HONNEUR, COACHS } from "@/content/bureau";

export const metadata: Metadata = {
  title: "Le bureau & les coachs",
  description: "Découvrez le bureau 2026 du TOAC Triathlon et son équipe d'encadrement.",
};

export default function BureauPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Le bureau & les coachs
      </h1>

      <h2 className="mt-10 font-display text-xl uppercase text-toac-blue-950">Bureau 2026</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BUREAU_2026.map((m, i) => (
          <div key={`${m.name}-${m.role}-${i}`} className="flex items-center gap-4 rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
            <ImagePlaceholder label={m.name} className="h-14 w-14 shrink-0 rounded-full" />
            <div>
              <div className="font-medium text-toac-blue-950">{m.name}</div>
              <div className="text-sm text-toac-blue-900/70">{m.role}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-toac-pink-500/40 bg-toac-pink-300/10 p-5">
        <div className="font-display uppercase text-toac-blue-950">{PRESIDENT_HONNEUR.name}</div>
        <p className="mt-1 text-sm text-toac-blue-900/80">{PRESIDENT_HONNEUR.description}</p>
      </div>

      <h2 className="mt-14 font-display text-xl uppercase text-toac-blue-950">Encadrement sportif</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COACHS.map((c) => (
          <div key={c.name} className="flex items-center gap-4 rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
            <ImagePlaceholder label={c.name} className="h-14 w-14 shrink-0 rounded-full" />
            <div>
              <div className="font-medium text-toac-blue-950">{c.name}</div>
              <div className="text-sm text-toac-blue-900/70">{c.discipline}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
