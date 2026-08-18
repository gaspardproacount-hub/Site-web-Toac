"use client";

import { useState } from "react";
import { CmsEditableText, renderRichText } from "@/components/cms-edit";
import type { CmsPageBlock } from "@/lib/cms";

const DEFAULT_HEADING = "Tarifs";

const DEFAULT_BODY = `**Cotisation club**
- Cotisation annuelle au club : 145 €
- Dépôt de garantie : 100 € (remboursé en cas de départ du club si engagement bénévole effectué)
- Trifonction : 95 € (uniquement pour les nouveaux)
- Tarif réduit : - 50 € (sur présentation d'un justificatif ayant-droit Airbus, étudiant, demandeur d'emploi)

**Licence**
Au choix parmi les 2 types de licence ci-dessous :
- Compétition : 105,70 €
- Loisir : 37,20 €

**Assurance**
- Entre 4,80 € et 190 € selon la formule choisie`;

/**
 * Bloc "Tarifs" replié par défaut, placé au-dessus des étapes de
 * "Nous rejoindre". Éditable via le CMS (page "nous-rejoindre-tarifs",
 * 1er bloc) dès qu'elle existe côté dashboard — sinon affiche ce contenu
 * de secours, non éditable.
 */
export default function TarifsAccordion({ block }: { block: CmsPageBlock | undefined }) {
  const [open, setOpen] = useState(false);
  const panelId = "tarifs-panel";

  return (
    <div className="mb-8 rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm">
      <div
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Masquer les tarifs" : "Afficher les tarifs"}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="flex cursor-pointer items-center justify-between gap-2"
      >
        {block ? (
          <CmsEditableText
            as="span"
            value={block.heading || DEFAULT_HEADING}
            target={{ kind: "block", id: block.id, field: "heading" }}
            className="font-display text-xl uppercase text-toac-blue-950"
          />
        ) : (
          <span className="font-display text-xl uppercase text-toac-blue-950">{DEFAULT_HEADING}</span>
        )}
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
            {block ? (
              <CmsEditableText
                as="div"
                value={block.body || DEFAULT_BODY}
                target={{ kind: "block", id: block.id, field: "body" }}
                multiline
                className="block"
              />
            ) : (
              <div>{renderRichText(DEFAULT_BODY)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
