// Mise en forme légère façon Markdown dans les textes CMS, sans éditeur
// riche : [texte du lien](/adhesion) pour un lien, [[texte du bouton]](/url)
// pour un bouton CTA, **texte** pour du gras, une ligne commençant par "- "
// pour une puce de liste, et un tableau façon Markdown (une ligne d'en-tête
// "| Colonne 1 | Colonne 2 |" suivie d'une ligne de séparation
// "| --- | --- |" puis des lignes de données). Le dashboard Devanture
// (LinkableTextarea) propose des boutons qui écrivent cette syntaxe
// automatiquement — inutile de la taper à la main.
//
// Module sans "use client" (contrairement à components/cms-edit.tsx) : ces
// fonctions ne font qu'assembler des éléments React à partir de texte, sans
// hook ni interactivité, donc peuvent être appelées aussi bien depuis un
// Server Component (ex. la page Règlement intérieur) que depuis le client.
import { createElement, type ReactNode } from "react";

const LINK_PATTERN = /\[([^\]]+)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g;
const BUTTON_PATTERN = /\[\[([^\]]+)\]\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g;
const BOLD_PATTERN = /\*\*([^*]+)\*\*/g;

const ctaButtonClassName =
  "inline-flex items-center justify-center rounded-md bg-toac-pink-500 px-4 py-2 font-display text-sm uppercase tracking-wide text-white no-underline transition hover:bg-toac-pink-400";

function parseBold(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  BOLD_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = BOLD_PATTERN.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(createElement("strong", { key: `${keyPrefix}-b-${key++}` }, match[1]));
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

/** Applique liens + gras sur un segment de texte (pas de bouton CTA). */
function parseLinksAndBold(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  LINK_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = LINK_PATTERN.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(...parseBold(text.slice(lastIndex, match.index), `${keyPrefix}-l${key}`));
    }
    const [, label, href] = match;
    const external = href.startsWith("http");
    parts.push(
      createElement(
        "a",
        {
          key: `${keyPrefix}-link-${key++}`,
          href,
          className: "underline decoration-1 underline-offset-2 hover:text-toac-pink-500",
          ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
        label
      )
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(...parseBold(text.slice(lastIndex), `${keyPrefix}-l${key}`));
  }
  return parts;
}

/** Applique boutons CTA + liens + gras sur une seule ligne de texte (pas de saut de ligne). */
export function linkifyText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  BUTTON_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = BUTTON_PATTERN.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(...parseLinksAndBold(text.slice(lastIndex, match.index), `b${key}`));
    }
    const [, label, href] = match;
    const external = href.startsWith("http");
    parts.push(
      createElement(
        "a",
        {
          key: `button-${key++}`,
          href,
          className: ctaButtonClassName,
          ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
        label
      )
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(...parseLinksAndBold(text.slice(lastIndex), `b${key}`));
  }
  return parts;
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 1;
}

/** Ligne "| --- | --- |" (tirets, avec ou sans ":" d'alignement) sous l'en-tête d'un tableau. */
function isTableSeparatorRow(line: string): boolean {
  if (!isTableRow(line)) return false;
  const cells = parseTableRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{1,}:?$/.test(cell));
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim().slice(1, -1);
  return trimmed.split("|").map((cell) => cell.trim());
}

function buildTable(headerCells: string[], rows: string[][], key: string): ReactNode {
  return createElement(
    "div",
    { key, className: "my-3 overflow-x-auto rounded-md border border-toac-gray-200" },
    createElement(
      "table",
      { className: "w-full min-w-[480px] border-collapse text-left text-sm" },
      createElement(
        "thead",
        null,
        createElement(
          "tr",
          { className: "bg-toac-gray-50 text-xs uppercase tracking-wide text-toac-blue-900/70" },
          headerCells.map((cell, i) =>
            createElement("th", { key: i, className: "border-b border-toac-gray-200 px-3 py-2" }, linkifyText(cell))
          )
        )
      ),
      createElement(
        "tbody",
        null,
        rows.map((row, ri) =>
          createElement(
            "tr",
            { key: ri, className: "border-b border-toac-gray-200 last:border-0" },
            row.map((cell, ci) => createElement("td", { key: ci, className: "px-3 py-2" }, linkifyText(cell)))
          )
        )
      )
    )
  );
}

/**
 * Comme linkifyText, mais gère aussi les listes à puces (lignes commençant
 * par "- " ou "• ", regroupées en <ul>), les tableaux façon Markdown, et les
 * sauts de ligne entre paragraphes. Toujours rendu dans un conteneur bloc
 * (jamais un <p>, un <ul>/<table> n'y serait pas valide) — voir
 * CmsEditableText, qui force `as="div"` dès que multiline est activé.
 */
export function renderRichText(text: string): ReactNode[] {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];
  let key = 0;
  let needsBreakBeforeNextLine = false;

  function flushList() {
    if (!listBuffer.length) return;
    blocks.push(
      createElement(
        "ul",
        { key: `ul-${key++}`, className: "my-2 list-disc space-y-1 pl-5" },
        listBuffer.map((item, i) => createElement("li", { key: i }, linkifyText(item)))
      )
    );
    listBuffer = [];
    needsBreakBeforeNextLine = false;
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (isTableRow(line) && i + 1 < lines.length && isTableSeparatorRow(lines[i + 1])) {
      flushList();
      const headerCells = parseTableRow(line);
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && isTableRow(lines[j])) {
        rows.push(parseTableRow(lines[j]));
        j++;
      }
      blocks.push(buildTable(headerCells, rows, `table-${key++}`));
      i = j;
      needsBreakBeforeNextLine = false;
      continue;
    }

    const bulletMatch = /^\s*[-•]\s+(.*)/.exec(line);
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1]);
      i++;
      continue;
    }
    flushList();
    if (needsBreakBeforeNextLine) {
      blocks.push(createElement("br", { key: `br-${key++}` }));
    }
    blocks.push(...linkifyText(line));
    needsBreakBeforeNextLine = true;
    i++;
  }
  flushList();

  return blocks;
}
