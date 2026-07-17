import type { Metadata } from "next";
import { Suspense } from "react";
import FaqAccordion from "@/components/FaqAccordion";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";
import { getCmsCatalog } from "@/lib/cms";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Toutes les réponses à vos questions sur l'adhésion, les entraînements, la compétition et la vie du TOAC Triathlon.",
};

const FAQ_PREFIX = "FAQ – ";

export default async function FaqPage() {
  const cmsCatalog = await getCmsCatalog();
  const faqSections = cmsCatalog?.filter((s) => s.name.startsWith(FAQ_PREFIX)) ?? [];

  const categories = faqSections.length ? faqSections.map((s) => s.name.slice(FAQ_PREFIX.length)) : undefined;
  const items = faqSections.length
    ? faqSections.flatMap((s) =>
        s.products.map((p) => ({
          id: p.id,
          categorie: s.name.slice(FAQ_PREFIX.length),
          question: p.name,
          reponse: p.description,
        }))
      )
    : undefined;

  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <CmsPageBlocks
        slug="faq"
        fallback={
          <>
            <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
              Foire aux questions
            </h1>
            <p className="mt-4 text-toac-blue-900/80">
              Une question sur l'adhésion, les entraînements, la compétition ou la vie du club ? Recherchez ou
              parcourez les catégories ci-dessous.
            </p>
          </>
        }
      />
      <div className="mt-8">
        <FaqAccordion categories={categories} items={items} editable={faqSections.length > 0} />
      </div>
    </div>
    </Suspense>
  );
}
