import type { Metadata } from "next";
import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { PARTENAIRES, PARTENAIRES_INSTITUTIONNELS } from "@/content/partenaires";

export const metadata: Metadata = {
  title: "Nos partenaires",
  description: "Les partenaires commerciaux et institutionnels du TOAC Triathlon.",
};

export default function PartenairesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Nos partenaires
      </h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PARTENAIRES.map((p) => (
          <div key={p.name} className="overflow-hidden rounded-lg border border-toac-gray-200 shadow-sm">
            <ImagePlaceholder label={`Logo ${p.name}`} className="h-32 w-full" />
            <div className="p-4">
              <div className="font-display uppercase text-toac-blue-950">{p.name}</div>
              <div className="text-sm text-toac-blue-900/70">
                {p.specialite} — {p.ville}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-md bg-toac-pink-300/20 border border-toac-pink-500/30 p-5 text-sm text-toac-blue-900">
        Adhérents : retrouvez le détail de vos avantages exclusifs dans l'
        <Link href="/espace-adherents/avantages" className="font-medium text-toac-blue-700 underline">
          espace adhérents
        </Link>
        .
      </div>

      <h2 className="mt-14 font-display text-xl uppercase text-toac-blue-950">Partenaires institutionnels</h2>
      <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-toac-blue-900/70">
        {PARTENAIRES_INSTITUTIONNELS.map((name) => (
          <span key={name}>{name}</span>
        ))}
      </div>
    </div>
  );
}
