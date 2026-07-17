"use client";

// Mode édition (?cms_edit=1) : affiché uniquement quand la page est ouverte
// dans l'aperçu du dashboard Devanture. Les textes modifiables sont directement
// éditables sur place (contentEditable) — la modification est envoyée à la
// fenêtre parente (le dashboard) qui l'enregistre en base, sans quitter l'aperçu.

import { useSearchParams } from "next/navigation";
import { createElement, type FocusEvent, type KeyboardEvent } from "react";

export function useCmsEditMode(): boolean {
  const searchParams = useSearchParams();
  return searchParams.get("cms_edit") === "1";
}

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

  if (!editMode) {
    return createElement(as, { className }, value);
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
    }
    if (e.key === "Escape") {
      e.currentTarget.textContent = value;
      e.currentTarget.blur();
    }
  }

  return createElement(
    as,
    {
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      className: `cms-editable ${className}`,
    },
    value
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
}: {
  payload: Record<string, unknown>;
  label: string;
}) {
  const editMode = useCmsEditMode();
  if (!editMode) return null;

  return (
    <button
      type="button"
      onClick={() => postToDashboard(payload)}
      className="flex min-h-[56px] w-full items-center justify-center rounded-xl border-2 border-dashed border-toac-blue-900/30 bg-toac-blue-900/5 text-sm font-medium text-toac-blue-950 hover:bg-toac-blue-900/10"
    >
      {label}
    </button>
  );
}
