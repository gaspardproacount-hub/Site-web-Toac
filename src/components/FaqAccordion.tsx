"use client";

import { useMemo, useState } from "react";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/content/faq";
import { CmsEditableText } from "@/components/cms-edit";

type FaqItem = { id: string; categorie: string; question: string; reponse: string };

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function AccordionItem({
  item,
  isOpen,
  onToggle,
  editable,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  editable: boolean;
}) {
  const panelId = `faq-panel-${item.id}`;
  const buttonId = `faq-button-${item.id}`;

  return (
    <div className="border-b border-toac-gray-200 last:border-0">
      <h3 className="flex items-center gap-2">
        {editable ? (
          <span className="flex w-full items-center justify-between gap-4 py-4 text-left">
            <CmsEditableText
              as="span"
              value={item.question}
              target={{ kind: "product", id: item.id, field: "name" }}
              className="font-medium text-toac-blue-950"
            />
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={onToggle}
              aria-label="Ouvrir / fermer"
              className="shrink-0 rounded p-1 hover:bg-toac-pink-300/10"
            >
              <svg
                aria-hidden="true"
                className={`h-4 w-4 shrink-0 text-toac-blue-700 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
              </svg>
            </button>
          </span>
        ) : (
          <button
            id={buttonId}
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-4 py-4 text-left transition hover:bg-toac-pink-300/10"
          >
            <span className="font-medium text-toac-blue-950">{item.question}</span>
            <svg
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 text-toac-blue-700 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
            </svg>
          </button>
        )}
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} className="faq-panel" data-open={isOpen}>
        <div>
          {editable ? (
            <CmsEditableText
              as="p"
              value={item.reponse}
              target={{ kind: "product", id: item.id, field: "description" }}
              multiline
              className="faq-panel-inner block pb-4 text-sm text-toac-blue-900/80"
            />
          ) : (
            <p className="faq-panel-inner pb-4 text-sm text-toac-blue-900/80">{item.reponse}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FaqAccordion({
  categories = FAQ_CATEGORIES,
  items = FAQ_ITEMS,
  editable = false,
}: {
  categories?: string[];
  items?: FaqItem[];
  editable?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.reponse.toLowerCase().includes(query)
    );
  }, [search, items]);

  const grouped = categories
    .map((categorie) => ({
      categorie,
      items: filtered.filter((item) => item.categorie === categorie),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div>
      <div className="mb-6">
        <label htmlFor="faq-search" className="sr-only">
          Rechercher dans la FAQ
        </label>
        <input
          id="faq-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une question…"
          className="w-full rounded-md border border-toac-gray-200 px-4 py-3 text-toac-blue-950 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-3 text-sm">
        {categories.map((cat) => (
          <a
            key={cat}
            href={`#${slugify(cat)}`}
            className="rounded-full border border-toac-blue-600 px-4 py-1.5 font-medium text-toac-blue-700 hover:bg-toac-blue-600 hover:text-white"
          >
            {cat}
          </a>
        ))}
      </div>

      {grouped.length === 0 && (
        <p className="text-toac-blue-900/70">Aucune question ne correspond à votre recherche.</p>
      )}

      <div className="space-y-10">
        {grouped.map((group) => (
          <section key={group.categorie} id={slugify(group.categorie)} className="scroll-mt-24">
            <h2 className="section-title font-display text-xl uppercase text-toac-blue-950">
              {group.categorie}
            </h2>
            <div className="mt-4 rounded-lg border border-toac-gray-200 bg-white px-5 shadow-sm">
              {group.items.map((item) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                  editable={editable}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
