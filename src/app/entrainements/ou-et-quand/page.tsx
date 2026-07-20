import type { Metadata } from "next";
import { Suspense } from "react";
import LieuxMap from "@/components/LieuxMap";
import { LIEUX } from "@/content/lieux";
import { getCmsPageBlocks, getCmsCatalog } from "@/lib/cms";
import { CmsEditableText, CmsAddTile } from "@/components/cms-edit";

export const metadata: Metadata = {
  title: "Où & Quand",
  description: "Carte et fiches détaillées des lieux d'entraînement du TOAC Triathlon.",
};

function parseLatLng(text: string): { lat: number; lng: number } | null {
  const parts = text.split(",").map((p) => Number(p.trim()));
  if (parts.length !== 2 || !parts.every((n) => Number.isFinite(n))) return null;
  return { lat: parts[0], lng: parts[1] };
}

export default async function OuEtQuandPage() {
  const [cmsBlocks, cmsCatalog] = await Promise.all([
    getCmsPageBlocks("ou-et-quand"),
    getCmsCatalog(),
  ]);
  const gpsSection = cmsCatalog?.find((s) => s.name === "Coordonnées GPS");

  const lieuxForMap = LIEUX.map((lieu) => {
    const override = gpsSection?.products.find((p) => p.name === lieu.nom);
    const coords = override ? parseLatLng(override.description) : null;
    return coords ? { ...lieu, lat: coords.lat, lng: coords.lng } : lieu;
  });

  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">Où & Quand</h1>
      <p className="mt-2 text-sm text-toac-blue-900/60">
        Coordonnées GPS et texte de chaque fiche modifiables depuis le dashboard (rubrique « Coordonnées GPS »
        du catalogue pour la position des marqueurs).
      </p>

      <div className="mt-8">
        <LieuxMap lieux={lieuxForMap} />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {cmsBlocks
          ? cmsBlocks.map((block) => (
              <div key={block.id} className="relative rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm">
                <CmsEditableText
                  as="h2"
                  value={block.heading}
                  target={{ kind: "block", id: block.id, field: "heading" }}
                  className="font-display text-base uppercase text-toac-blue-950"
                />
                <CmsEditableText
                  as="p"
                  value={block.body}
                  target={{ kind: "block", id: block.id, field: "body" }}
                  multiline
                  className="mt-2 block whitespace-pre-line text-sm text-toac-blue-900/80"
                />
              </div>
            ))
          : LIEUX.map((lieu) => (
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
        <CmsAddTile payload={{ type: "add-block" }} label="+ Ajouter un lieu" />
      </div>
    </div>
    </Suspense>
  );
}
