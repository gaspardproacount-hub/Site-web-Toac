"use client";

// Même principe qu'EnsureCmsBlocks, mais pour un contenu statique adossé au
// catalogue plutôt qu'à un bloc de page (ex : "Président d'honneur") : crée
// silencieusement la rubrique + le produit correspondants dès l'ouverture de
// l'aperçu dans le dashboard, si aucun des deux n'existe encore.

import { useEffect, useRef } from "react";
import { postToDashboard, useCmsEditMode } from "@/components/cms-edit";

export type EnsureProductSpec = { sectionName: string; name: string; description: string };

export default function EnsureCmsProduct({ product }: { product: EnsureProductSpec | false }) {
  const editMode = useCmsEditMode();
  const productRef = useRef(product);

  useEffect(() => {
    if (!editMode || !productRef.current) return;
    postToDashboard({ type: "ensure-product", product: productRef.current });
  }, [editMode]);

  return null;
}
