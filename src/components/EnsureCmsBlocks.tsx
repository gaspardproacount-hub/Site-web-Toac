"use client";

// Crée automatiquement, sans aucun clic, les blocs "à emplacement fixe"
// encore manquants pour cette page (ex: le titre, la date...), dès que
// l'aperçu s'ouvre dans le dashboard. Avant : un lien "+ Rendre modifiable"
// fallait cliquer une fois par emplacement — remplacé par une création
// silencieuse, transparente pour l'admin qui n'a plus qu'à modifier.
// N'a aucun effet hors du dashboard (postMessage sans destinataire).

import { useEffect, useRef } from "react";
import { postToDashboard, useCmsEditMode } from "@/components/cms-edit";

export type EnsureBlockSpec = { slot: string; heading: string; body: string; block_type?: string };

/**
 * `slug` : slug réel de la page du site (celui passé à getCmsPageBlocks),
 * transmis au dashboard pour qu'il crée le bloc sur la BONNE page — une
 * page "-sections" prévisualise via sa page parente (même URL d'aperçu,
 * voir lib/preview-url.ts côté Devanture), donc l'écran dashboard
 * actuellement ouvert n'est pas forcément celui de cette page-ci.
 */
export default function EnsureCmsBlocks({ slug, blocks }: { slug: string; blocks: EnsureBlockSpec[] }) {
  const editMode = useCmsEditMode();
  const blocksRef = useRef(blocks);

  useEffect(() => {
    if (!editMode || blocksRef.current.length === 0) return;
    postToDashboard({ type: "ensure-blocks", slug, blocks: blocksRef.current });
  }, [editMode, slug]);

  return null;
}
