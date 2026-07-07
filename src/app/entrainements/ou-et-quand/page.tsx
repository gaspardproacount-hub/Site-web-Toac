import type { Metadata } from "next";
import LieuxMap from "@/components/LieuxMap";
import { LIEUX } from "@/content/lieux";

export const metadata: Metadata = {
  title: "Où & Quand",
  description: "Carte et fiches détaillées des lieux d'entraînement du TOAC Triathlon.",
};

export default function OuEtQuandPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">Où & Quand</h1>

      <div className="mt-8">
        <LieuxMap lieux={LIEUX} />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {LIEUX.map((lieu) => (
          <div key={lieu.id} className="rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base uppercase text-toac-blue-950">{lieu.nom}</h2>
            <p className="mt-1 text-sm text-toac-blue-900/70">{lieu.adresse}</p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Discipline(s) :</span> {lieu.disciplines.join(", ")}
            </p>
            <p className="text-sm">
              <span className="font-medium">Créneaux :</span> {lieu.creneaux}
            </p>
            {lieu.consignes && (
              <p className="mt-2 rounded-md bg-toac-pink-300/10 p-2 text-xs text-toac-blue-900">
                ⚠️ {lieu.consignes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
