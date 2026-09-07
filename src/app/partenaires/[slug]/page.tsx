import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCmsPages, getCmsCatalog } from "@/lib/cms";
import { slugify } from "@/lib/slug";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";
import { CmsEditableImage } from "@/components/cms-edit";
import AlltricksSignupForm from "@/components/AlltricksSignupForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pages = await getCmsPages();
  const page = pages?.find((p) => p.slug === slug);
  return { title: page?.title ?? "Partenaire" };
}

export default async function PartenairePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ merci?: string }>;
}) {
  const [{ slug }, { merci }, pages, cmsCatalog] = await Promise.all([
    params,
    searchParams,
    getCmsPages(),
    getCmsCatalog(),
  ]);
  const page = pages?.find((p) => p.slug === slug);

  if (!page) {
    notFound();
  }

  const partner = cmsCatalog
    ?.flatMap((section) => section.products)
    .find((p) => slugify(p.name) === slug);

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {partner?.image_url && (
            <CmsEditableImage
              src={partner.image_url}
              alt={`Logo ${partner.name}`}
              target={{ kind: "product", id: partner.id }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-toac-gray-200 bg-white p-1.5"
              imgClassName="max-h-full max-w-full object-contain"
            />
          )}
          <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
            {page.title}
          </h1>
        </div>
      </div>

      <CmsPageBlocks
        slug={slug}
        fallback={
          <p className="mx-auto max-w-4xl px-4 pt-6 text-sm text-toac-blue-900/60 sm:px-6 lg:px-8">
            Contenu à venir.
          </p>
        }
      />

      {slug === "alltricks" && (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AlltricksSignupForm showConfirmation={merci === "1"} />
        </div>
      )}
    </div>
  );
}
