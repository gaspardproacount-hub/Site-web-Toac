import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import SiteImage from "@/components/SiteImage";
import { slugify } from "@/lib/slug";
import { PARTENAIRES, PARTENAIRES_INSTITUTIONNELS } from "@/content/partenaires";
import { getCmsCatalog } from "@/lib/cms";
import { CmsEditableText, CmsAddTile } from "@/components/cms-edit";

export const metadata: Metadata = {
  title: "Nos partenaires",
  description: "Les partenaires commerciaux et institutionnels du TOAC Triathlon.",
};

export default async function PartenairesPage() {
  const cmsCatalog = await getCmsCatalog();
  const partenairesSection = cmsCatalog?.find((s) => s.name === "Partenaires");

  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Nos partenaires
      </h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {partenairesSection
          ? partenairesSection.products.map((p) => (
              <div
                key={p.id}
                className="relative overflow-hidden rounded-lg border border-toac-gray-200 shadow-sm"
              >
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={`Logo ${p.name}`} className="h-32 w-full object-cover" />
                ) : (
                  <div className="h-32 w-full bg-toac-gray-100" />
                )}
                <div className="p-4">
                  <CmsEditableText
                    as="div"
                    value={p.name}
                    target={{ kind: "product", id: p.id, field: "name" }}
                    className="font-display uppercase text-toac-blue-950"
                  />
                  <CmsEditableText
                    as="div"
                    value={p.description}
                    target={{ kind: "product", id: p.id, field: "description" }}
                    className="text-sm text-toac-blue-900/70"
                  />
                </div>
              </div>
            ))
          : PARTENAIRES.map((p) => (
              <div key={p.name} className="overflow-hidden rounded-lg border border-toac-gray-200 shadow-sm">
                <SiteImage name={`partenaire-${slugify(p.name)}`} label={`Logo ${p.name}`} className="h-32 w-full" />
                <div className="p-4">
                  <div className="font-display uppercase text-toac-blue-950">{p.name}</div>
                  <div className="text-sm text-toac-blue-900/70">
                    {p.specialite} — {p.ville}
                  </div>
                </div>
              </div>
            ))}
        <CmsAddTile
          payload={{ type: "add-product", sectionId: partenairesSection?.id }}
          label="+ Ajouter un partenaire"
        />
      </div>

      <div className="mt-10 rounded-md bg-toac-pink-300/20 border border-toac-pink-500/30 p-5 text-sm text-toac-blue-900">
        Adhérents : retrouvez le détail de vos avantages exclusifs dans l&apos;
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
    </Suspense>
  );
}
