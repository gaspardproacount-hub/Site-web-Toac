"use client";

import { useEffect, useState } from "react";
import { CmsEditableText, CmsEditableImage, CmsEditPencil } from "@/components/cms-edit";
import type { CmsPageBlock } from "@/lib/cms";

/**
 * Rendu générique d'un bloc dont le type (dashboard → "Type de bloc") est
 * "accordion" : replié par défaut, sur n'importe quelle page. Avant ce
 * composant, seul le bloc Tarifs de /adhesion (TarifsAccordion) donnait un
 * sens visuel à ce type — choisi ailleurs dans le dashboard, il ne changeait
 * rien à l'affichage puisqu'aucun autre code ne le lisait.
 */
export default function AccordionBlock({ block, className = "" }: { block: CmsPageBlock; className?: string }) {
  const [open, setOpen] = useState(false);
  const panelId = `accordion-panel-${block.id}`;

  // Ouvre l'accordéon automatiquement quand l'URL pointe directement dessus
  // (ex. https://.../natation#tests), sinon un lien vers une ancre repliée
  // fait juste défiler jusqu'à un titre fermé, sans montrer le contenu visé.
  useEffect(() => {
    if (!block.anchor) return;
    const matchesHash = () => window.location.hash === `#${block.anchor}`;
    const checkHash = () => {
      if (matchesHash()) setOpen(true);
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [block.anchor]);

  return (
    <div
      id={block.anchor ?? undefined}
      className={`relative scroll-mt-24 rounded-lg border border-toac-gray-200 bg-white p-5 pr-10 shadow-sm ${className}`}
    >
      <CmsEditPencil payload={{ type: "edit-block", blockId: block.id }} className="absolute right-3 top-3" />
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Masquer" : "Afficher"}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="flex cursor-pointer items-center justify-between gap-2"
      >
        <CmsEditableText
          as="span"
          value={block.heading}
          target={{ kind: "block", id: block.id, field: "heading" }}
          className="font-display text-lg uppercase text-toac-blue-950"
        />
        <span aria-hidden="true" className="shrink-0 text-toac-blue-700">
          <svg
            className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
          </svg>
        </span>
      </div>
      <div id={panelId} className="faq-panel" data-open={open}>
        <div>
          <div className="faq-panel-inner pt-4 text-sm text-toac-blue-900/80">
            {block.image_url && (
              <CmsEditableImage
                src={block.image_url}
                alt={block.heading}
                target={{ kind: "block", id: block.id }}
                className="mb-4 aspect-video w-full overflow-hidden rounded-md"
                imgClassName="aspect-video w-full rounded-md object-cover"
              />
            )}
            <CmsEditableText
              as="div"
              value={block.body}
              target={{ kind: "block", id: block.id, field: "body" }}
              multiline
              className="block whitespace-pre-line"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
