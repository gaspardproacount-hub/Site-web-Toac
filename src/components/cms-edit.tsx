"use client";

// Mode édition (?cms_edit=1) : affiché uniquement quand la page est ouverte
// dans l'aperçu du dashboard Devanture. Les textes modifiables sont directement
// éditables sur place (contentEditable) — la modification est envoyée à la
// fenêtre parente (le dashboard) qui l'enregistre en base, sans quitter l'aperçu.

import { useSearchParams } from "next/navigation";
import {
  createElement,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { PhotoLightbox } from "@/components/PhotoLightbox";

export function useCmsEditMode(): boolean {
  const searchParams = useSearchParams();
  return searchParams.get("cms_edit") === "1";
}

// Mise en forme légère façon Markdown dans les textes CMS, sans éditeur
// riche : [texte du lien](/nous-rejoindre) pour un lien, [[texte du bouton]](/url)
// pour un bouton CTA, **texte** pour du gras, une ligne commençant par "- "
// pour une puce de liste. Le dashboard Devanture (LinkableTextarea) propose
// des boutons qui écrivent cette syntaxe automatiquement — inutile de la
// taper à la main.
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

// Position du curseur/de la sélection dans un élément contentEditable,
// exprimée en index de caractères dans son texte brut (indépendant de la
// structure DOM interne) — permet d'insérer du texte au bon endroit avec de
// simples découpages de chaîne, comme pour un <textarea>.
function getCaretOffsets(el: HTMLElement): { start: number; end: number } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!el.contains(range.commonAncestorContainer)) return null;

  const preStart = range.cloneRange();
  preStart.selectNodeContents(el);
  preStart.setEnd(range.startContainer, range.startOffset);
  const start = preStart.toString().length;

  const preEnd = range.cloneRange();
  preEnd.selectNodeContents(el);
  preEnd.setEnd(range.endContainer, range.endOffset);
  const end = preEnd.toString().length;

  return { start, end };
}

type CaretPoint = { node: Node; offset: number };

function findCaretPoint(el: HTMLElement, target: number): CaretPoint | null {
  let charIndex = 0;
  let result: CaretPoint | null = null;

  function walk(node: Node) {
    if (result) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const length = node.textContent?.length ?? 0;
      const nextCharIndex = charIndex + length;
      if (target >= charIndex && target <= nextCharIndex) {
        result = { node, offset: target - charIndex };
      }
      charIndex = nextCharIndex;
    } else {
      node.childNodes.forEach(walk);
    }
  }
  walk(el);

  return result;
}

function setCaretOffsets(el: HTMLElement, start: number, end: number) {
  const selection = window.getSelection();
  if (!selection) return;

  const startPoint = findCaretPoint(el, start);
  const endPoint = findCaretPoint(el, end);

  const range = document.createRange();
  if (startPoint) range.setStart(startPoint.node, startPoint.offset);
  else range.setStart(el, 0);
  if (endPoint) range.setEnd(endPoint.node, endPoint.offset);
  else range.setEnd(el, 0);
  selection.removeAllRanges();
  selection.addRange(range);
}

const toolbarButtonClass =
  "rounded border border-toac-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-toac-blue-900 hover:bg-toac-pink-300/10";

export function postToDashboard(payload: Record<string, unknown>) {
  window.parent.postMessage({ source: "devanture-preview", ...payload }, "*");
}

export type InlineTarget = { kind: "product" | "block"; id: string; field: string };

/**
 * Texte modifiable directement dans l'aperçu. Hors mode édition, rend un
 * simple élément statique (aucun surcoût, aucun changement visuel).
 */
export function CmsEditableText({
  value,
  target,
  as = "span",
  className = "",
  multiline = false,
}: {
  value: string;
  target: InlineTarget;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3";
  className?: string;
  multiline?: boolean;
}) {
  const editMode = useCmsEditMode();
  const elRef = useRef<HTMLElement>(null);
  // Un <ul> (liste à puces) n'est pas un contenu valide dans un <p> : dès que
  // multiline est activé, on rend toujours un <div>, quel que soit `as`.
  const tag = multiline && as === "p" ? "div" : as;

  if (!editMode) {
    return createElement(tag, { className }, multiline ? renderRichText(value) : value);
  }

  function handleBlur(e: FocusEvent<HTMLElement>) {
    const el = e.currentTarget;
    const newValue = (el.textContent ?? "").trim();
    if (newValue && newValue !== value.trim()) {
      postToDashboard({ type: "inline-update", target, value: newValue });
      el.classList.add("cms-just-saved");
      setTimeout(() => el.classList.remove("cms-just-saved"), 1200);
    } else if (!newValue) {
      el.textContent = value;
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (!multiline && e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
      return;
    }
    if (multiline && e.key === "Enter") {
      // Empêche le navigateur d'insérer un <div>/<br> natif : ça découpe le
      // texte en plusieurs nœuds DOM et le "\n" est perdu quand on relit
      // el.textContent au blur, ce qui casse ensuite les listes à puces.
      // On insère un vrai "\n" à la main, comme pour le gras/lien/liste.
      e.preventDefault();
      const el = e.currentTarget;
      const text = el.textContent ?? "";
      const offsets = getCaretOffsets(el);
      const start = offsets?.start ?? text.length;
      const end = offsets?.end ?? text.length;
      el.textContent = text.slice(0, start) + "\n" + text.slice(end);
      setCaretOffsets(el, start + 1, start + 1);
      return;
    }
    if (e.key === "Escape") {
      e.currentTarget.textContent = value;
      e.currentTarget.blur();
    }
  }

  // Insère/retire de la mise en forme légère (gras, liste, lien) directement
  // au point du curseur dans l'aperçu, sans passer par le dashboard. Les
  // offsets de sélection sont capturés AVANT tout window.prompt() (dont le
  // comportement sur la sélection en cours varie selon les navigateurs) et
  // réappliqués ensuite par leur position, pas par une référence au Range.
  function toggleBold() {
    const el = elRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    const offsets = getCaretOffsets(el);
    const start = offsets?.start ?? text.length;
    const end = offsets?.end ?? text.length;
    const selected = text.slice(start, end);
    const before = text.slice(Math.max(0, start - 2), start);
    const after = text.slice(end, end + 2);

    el.focus();
    if (selected.length >= 4 && selected.startsWith("**") && selected.endsWith("**")) {
      const inner = selected.slice(2, -2);
      el.textContent = text.slice(0, start) + inner + text.slice(end);
      setCaretOffsets(el, start, start + inner.length);
      return;
    }
    if (before === "**" && after === "**") {
      el.textContent = text.slice(0, start - 2) + selected + text.slice(end + 2);
      setCaretOffsets(el, start - 2, start - 2 + selected.length);
      return;
    }
    const inner = selected || "texte en gras";
    el.textContent = text.slice(0, start) + `**${inner}**` + text.slice(end);
    setCaretOffsets(el, start + 2, start + 2 + inner.length);
  }

  function insertBulletList() {
    const el = elRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    const offsets = getCaretOffsets(el);
    const start = offsets?.start ?? text.length;
    const end = offsets?.end ?? text.length;
    const selected = text.slice(start, end);

    const inserted = selected
      ? selected
          .split("\n")
          .map((line) => (line.trim() ? `- ${line.replace(/^\s*[-•]\s*/, "")}` : line))
          .join("\n")
      : "\n- élément 1\n- élément 2";

    el.textContent = text.slice(0, start) + inserted + text.slice(end);
    el.focus();
    const selStart = selected ? start : start + 1;
    setCaretOffsets(el, selStart, start + inserted.length);
  }

  function insertLink() {
    const el = elRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    const offsets = getCaretOffsets(el);
    const start = offsets?.start ?? text.length;
    const end = offsets?.end ?? text.length;
    const selected = text.slice(start, end);

    const label = window.prompt("Texte du lien (ce que le visiteur voit) :", selected || "cliquez ici");
    if (!label) return;
    const url = window.prompt(
      "Adresse du lien : une page du site (ex. /nous-rejoindre) ou une adresse complète (https://...)",
      "/"
    );
    if (!url) return;

    const markdown = `[${label}](${url})`;
    el.textContent = text.slice(0, start) + markdown + text.slice(end);
    el.focus();
    const cursor = start + markdown.length;
    setCaretOffsets(el, cursor, cursor);
  }

  function insertButton() {
    const el = elRef.current;
    if (!el) return;
    const text = el.textContent ?? "";
    const offsets = getCaretOffsets(el);
    const start = offsets?.start ?? text.length;
    const end = offsets?.end ?? text.length;
    const selected = text.slice(start, end);

    const label = window.prompt("Texte du bouton :", selected || "En savoir plus");
    if (!label) return;
    const url = window.prompt(
      "Adresse du bouton : une page du site (ex. /nous-rejoindre) ou une adresse complète (https://...)",
      "/"
    );
    if (!url) return;

    const markdown = `[[${label}]](${url})`;
    el.textContent = text.slice(0, start) + markdown + text.slice(end);
    el.focus();
    const cursor = start + markdown.length;
    setCaretOffsets(el, cursor, cursor);
  }

  const Tag = tag;
  const editable = (
    <Tag
      key="editable"
      ref={elRef as Ref<HTMLDivElement>}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      className={`cms-editable ${className}`}
    >
      {value}
    </Tag>
  );

  if (!multiline) return editable;

  return (
    <div className="cms-rich-wrap">
      <div className="mb-1 flex gap-1" contentEditable={false}>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={toggleBold} className={toolbarButtonClass}>
          Gras
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertBulletList}
          className={toolbarButtonClass}
        >
          • Liste
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={insertLink} className={toolbarButtonClass}>
          🔗 Lien
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={insertButton} className={toolbarButtonClass}>
          🔘 Bouton
        </button>
      </div>
      {editable}
    </div>
  );
}

/**
 * Nom de partenaire éditable, devenant un lien hypertexte vers son site web
 * dès qu'une URL est renseignée côté CMS (champ "Site web" du produit). Hors
 * mode édition uniquement : en édition, on garde le texte simplement
 * modifiable pour ne pas imbriquer un <a> autour d'un contentEditable.
 */
export function CmsPartnerName({
  value,
  url,
  target,
  as = "span",
  className = "",
}: {
  value: string;
  url?: string | null;
  target: InlineTarget;
  as?: "span" | "div" | "h3";
  className?: string;
}) {
  const editMode = useCmsEditMode();

  if (!editMode && url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {value}
      </a>
    );
  }

  return <CmsEditableText value={value} target={target} as={as} className={className} />;
}

export type ImageTarget = { kind: "product" | "block"; id: string };

/**
 * Image modifiable directement dans l'aperçu : au clic, ouvre le sélecteur de
 * fichiers, envoie l'image (en base64) au dashboard qui la redimensionne, la
 * stocke et met à jour le produit/bloc concerné. Hors mode édition, rend une
 * simple balise <img> (ou rien si aucune image).
 */
export function CmsEditableImage({
  src,
  alt,
  target,
  className = "",
  imgClassName = "",
  zoomable = false,
}: {
  src: string | null;
  alt: string;
  target: ImageTarget;
  className?: string;
  imgClassName?: string;
  /** Ouvre la photo en grand au clic, hors mode édition (où le clic sert déjà à la changer). */
  zoomable?: boolean;
}) {
  const editMode = useCmsEditMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(src);
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!editMode) {
    if (src && zoomable) {
      return (
        <>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`Agrandir la photo — ${alt}`}
            className={`block cursor-zoom-in p-0 ${className}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className={imgClassName} />
          </button>
          {lightboxOpen && (
            <PhotoLightbox src={src} alt={alt} onClose={() => setLightboxOpen(false)} />
          )}
        </>
      );
    }
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {src && <img src={src} alt={alt} className={imgClassName} />}
      </div>
    );
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setPreview(dataUrl);
      postToDashboard({ type: "inline-image-update", target, dataUrl });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className={`relative ${className}`}>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={alt} className={imgClassName} />
      ) : (
        <div className={`flex items-center justify-center bg-toac-gray-100 text-xs text-toac-blue-900/50 ${imgClassName}`}>
          Aucune image
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Changer l'image"
        className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/0 text-xs font-medium text-transparent transition hover:bg-black/40 hover:text-white"
      >
        {uploading ? "Envoi…" : "✎ Changer l'image"}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
}

export function CmsEditPencil({
  payload,
  className = "",
}: {
  payload: Record<string, unknown>;
  className?: string;
}) {
  const editMode = useCmsEditMode();
  if (!editMode) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        postToDashboard(payload);
      }}
      aria-label="Modifier"
      className={
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white bg-black text-xs text-white shadow-md " +
        className
      }
    >
      ✎
    </button>
  );
}

export function CmsAddTile({
  payload,
  label,
  className,
}: {
  payload: Record<string, unknown>;
  label: string;
  className?: string;
}) {
  const editMode = useCmsEditMode();
  if (!editMode) return null;

  return (
    <button
      type="button"
      onClick={() => postToDashboard(payload)}
      className={
        className ??
        "flex min-h-[56px] w-full items-center justify-center rounded-xl border-2 border-dashed border-toac-blue-900/30 bg-toac-blue-900/5 text-sm font-medium text-toac-blue-950 hover:bg-toac-blue-900/10"
      }
    >
      {label}
    </button>
  );
}
