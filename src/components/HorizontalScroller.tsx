"use client";

import { useRef, type ReactNode } from "react";

/**
 * Rangée défilable horizontalement (glisser au doigt/souris + flèches),
 * utilisée pour le bloc "Nos partenaires" de l'accueil. Générique : ne
 * connaît rien du contenu, juste des enfants à faire défiler.
 */
export default function HorizontalScroller({ children }: { children: ReactNode }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Partenaires précédents"
        className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-toac-gray-200 bg-white text-toac-blue-950 shadow-sm transition hover:bg-toac-gray-50 sm:flex"
      >
        ‹
      </button>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Partenaires suivants"
        className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-toac-gray-200 bg-white text-toac-blue-950 shadow-sm transition hover:bg-toac-gray-50 sm:flex"
      >
        ›
      </button>
    </div>
  );
}
