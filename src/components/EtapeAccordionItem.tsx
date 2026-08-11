"use client";

import { useState } from "react";
import { CmsEditableText } from "@/components/cms-edit";
import type { CmsPageBlock } from "@/lib/cms";

/**
 * Étape numérotée dépliable : le titre reste toujours visible, un clic
 * révèle un champ "précisions" (block.body) éditable via le CMS Devanture
 * (?cms_edit=1). Vide par défaut — à remplir depuis le dashboard.
 */
export default function EtapeAccordionItem({ index, block }: { index: number; block: CmsPageBlock }) {
  const [open, setOpen] = useState(index === 0);
  const panelId = `etape-panel-${block.id}`;

  return (
    <li className="border-b border-toac-gray-100 pb-3 last:border-0">
      <div className="flex items-start gap-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-toac-blue-950 font-display text-sm text-toac-pink-400">
          {index + 1}
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <CmsEditableText
              as="span"
              value={block.heading}
              target={{ kind: "block", id: block.id, field: "heading" }}
              className="block pt-1 text-toac-blue-900/90"
            />
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Masquer les précisions" : "Afficher les précisions"}
              className="shrink-0 rounded-full p-1 text-toac-blue-700 transition hover:bg-toac-pink-300/10"
            >
              <svg
                aria-hidden="true"
                className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
              </svg>
            </button>
          </div>
          <div id={panelId} className="faq-panel" data-open={open}>
            <div>
              <div className="faq-panel-inner pt-2">
                <CmsEditableText
                  as="p"
                  value={block.body}
                  target={{ kind: "block", id: block.id, field: "body" }}
                  multiline
                  className="min-h-[1.5em] block text-sm text-toac-blue-900/70"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
