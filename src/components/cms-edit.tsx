"use client";

// Mode édition (?cms_edit=1) : affiché uniquement quand la page est ouverte
// dans l'aperçu du dashboard Devanture. Ajoute des crayons ✎ cliquables sur
// les éléments modifiables, qui préviennent la fenêtre parente (le dashboard)
// pour qu'elle ouvre directement le bon bloc.

import { useSearchParams } from "next/navigation";

export function useCmsEditMode(): boolean {
  const searchParams = useSearchParams();
  return searchParams.get("cms_edit") === "1";
}

export function postToDashboard(payload: Record<string, unknown>) {
  window.parent.postMessage({ source: "devanture-preview", ...payload }, "*");
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
