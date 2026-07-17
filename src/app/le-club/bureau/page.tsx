import type { Metadata } from "next";
import { Suspense } from "react";
import SiteImage from "@/components/SiteImage";
import { slugify } from "@/lib/slug";
import { BUREAU_2026, PRESIDENT_HONNEUR, COACHS } from "@/content/bureau";
import { getCmsCatalog } from "@/lib/cms";
import { CmsEditableText, CmsAddTile } from "@/components/cms-edit";

export const metadata: Metadata = {
  title: "Le bureau & les coachs",
  description: "Découvrez le bureau 2026 du TOAC Triathlon et son équipe d'encadrement.",
};

export default async function BureauPage() {
  const cmsCatalog = await getCmsCatalog();

  const bureauSection = cmsCatalog?.find((s) => s.name === "Bureau 2026");
  const coachsSection = cmsCatalog?.find((s) => s.name === "Encadrement sportif");

  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Le bureau & les coachs
      </h1>

      <h2 className="mt-10 font-display text-xl uppercase text-toac-blue-950">Bureau 2026</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bureauSection
          ? bureauSection.products.map((m) => (
              <div
                key={m.id}
                className="relative flex items-center gap-4 rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm"
              >
                {m.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image_url} alt={m.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-full bg-toac-gray-200" />
                )}
                <div>
                  <CmsEditableText
                    as="div"
                    value={m.name}
                    target={{ kind: "product", id: m.id, field: "name" }}
                    className="font-medium text-toac-blue-950"
                  />
                  <CmsEditableText
                    as="div"
                    value={m.description}
                    target={{ kind: "product", id: m.id, field: "description" }}
                    className="text-sm text-toac-blue-900/70"
                  />
                </div>
              </div>
            ))
          : BUREAU_2026.map((m, i) => (
              <div key={`${m.name}-${m.role}-${i}`} className="flex items-center gap-4 rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
                <SiteImage name={`bureau-${slugify(m.name)}`} label={m.name} className="h-14 w-14 shrink-0 rounded-full" />
                <div>
                  <div className="font-medium text-toac-blue-950">{m.name}</div>
                  <div className="text-sm text-toac-blue-900/70">{m.role}</div>
                </div>
              </div>
            ))}
        <CmsAddTile
          payload={{ type: "add-product", sectionId: bureauSection?.id }}
          label="+ Ajouter un membre du bureau"
        />
      </div>

      <div className="mt-8 rounded-lg border border-toac-pink-500/40 bg-toac-pink-300/10 p-5">
        <div className="font-display uppercase text-toac-blue-950">{PRESIDENT_HONNEUR.name}</div>
        <p className="mt-1 text-sm text-toac-blue-900/80">{PRESIDENT_HONNEUR.description}</p>
      </div>

      <h2 className="mt-14 font-display text-xl uppercase text-toac-blue-950">Encadrement sportif</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coachsSection
          ? coachsSection.products.map((c) => (
              <div
                key={c.id}
                className="relative flex items-center gap-4 rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm"
              >
                {c.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image_url} alt={c.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-full bg-toac-gray-200" />
                )}
                <div>
                  <CmsEditableText
                    as="div"
                    value={c.name}
                    target={{ kind: "product", id: c.id, field: "name" }}
                    className="font-medium text-toac-blue-950"
                  />
                  <CmsEditableText
                    as="div"
                    value={c.description}
                    target={{ kind: "product", id: c.id, field: "description" }}
                    className="text-sm text-toac-blue-900/70"
                  />
                </div>
              </div>
            ))
          : COACHS.map((c) => (
              <div key={c.name} className="flex items-center gap-4 rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
                <SiteImage name={`coach-${slugify(c.name)}`} label={c.name} className="h-14 w-14 shrink-0 rounded-full" />
                <div>
                  <div className="font-medium text-toac-blue-950">{c.name}</div>
                  <div className="text-sm text-toac-blue-900/70">{c.discipline}</div>
                </div>
              </div>
            ))}
        <CmsAddTile
          payload={{ type: "add-product", sectionId: coachsSection?.id }}
          label="+ Ajouter un coach"
        />
      </div>
    </div>
    </Suspense>
  );
}
