import type { Metadata } from "next";
import { Suspense } from "react";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";

export const metadata: Metadata = {
  title: "Arbitrage",
};

export default function ArbitragePage() {
  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Arbitrage
      </h1>

      <CmsPageBlocks slug="arbitrage" fallback={null} />
    </div>
    </Suspense>
  );
}
