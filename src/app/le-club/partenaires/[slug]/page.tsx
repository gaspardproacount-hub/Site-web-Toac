import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCmsPages } from "@/lib/cms";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";
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
  const [{ slug }, { merci }] = await Promise.all([params, searchParams]);
  const pages = await getCmsPages();
  const page = pages?.find((p) => p.slug === slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-4xl px-4 pt-16 sm:px-6 lg:px-8">
        <Link href="/le-club/partenaires" className="text-sm font-medium text-toac-blue-700 hover:underline">
          ← Retour aux partenaires
        </Link>
        <h1 className="section-title mt-4 font-display text-3xl uppercase text-toac-blue-950">
          {page.title}
        </h1>
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
