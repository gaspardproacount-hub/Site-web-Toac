// Mise en forme légère façon Markdown dans les textes CMS, sans éditeur
// riche : [texte du lien](/nous-rejoindre) pour un lien, [[texte du bouton]](/url)
// pour un bouton CTA, **texte** pour du gras, une ligne commençant par "- "
// pour une puce de liste. Le dashboard Devanture (LinkableTextarea) propose
// des boutons qui écrivent cette syntaxe automatiquement — inutile de la
// taper à la main.
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

/**
 * Comme linkifyText, mais gère aussi les listes à puces (lignes commençant
 * par "- " ou "• ", regroupées en <ul>) et les sauts de ligne entre
 * paragraphes. Toujours rendu dans un conteneur bloc (jamais un <p>, un <ul>
 * n'y serait pas valide) — voir CmsEditableText, qui force `as="div"` dès
 * que multiline est activé.
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

  for (const line of lines) {
    const bulletMatch = /^\s*[-•]\s+(.*)/.exec(line);
    if (bulletMatch) {
      listBuffer.push(bulletMatch[1]);
      continue;
    }
    flushList();
    if (needsBreakBeforeNextLine) {
      blocks.push(createElement("br", { key: `br-${key++}` }));
    }
    blocks.push(...linkifyText(line));
    needsBreakBeforeNextLine = true;
  }
  flushList();

  return blocks;
}
