"use client";

// Crée automatiquement, sans aucun clic, les blocs "à emplacement fixe"
// encore manquants pour cette page (ex: le titre, la date...), dès que
// l'aperçu s'ouvre dans le dashboard. Avant : un lien "+ Rendre modifiable"
// fallait cliquer une fois par emplacement — remplacé par une création
// silencieuse, transparente pour l'admin qui n'a plus qu'à modifier.
// N'a aucun effet hors du dashboard (postMessage sans destinataire).

import { useEffect, useRef } from "react";
import { postToDashboard, useCmsEditMode } from "@/components/cms-edit";

export type EnsureBlockSpec = { slot: string; heading: string; body: string };

export default function EnsureCmsBlocks({ blocks }: { blocks: EnsureBlockSpec[] }) {
  const editMode = useCmsEditMode();
  const blocksRef = useRef(blocks);

  useEffect(() => {
    if (!editMode || blocksRef.current.length === 0) return;
    postToDashboard({ type: "ensure-blocks", blocks: blocksRef.current });
  }, [editMode]);

  return null;
}
