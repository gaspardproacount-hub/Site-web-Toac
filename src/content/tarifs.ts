/**
 * TARIFS_A_CONFIRMER — montants à confirmer par le bureau avant mise en
 * production (les tarifs 2025 seraient reconduits en 2026 d'après le
 * prompt initial, mais les montants exacts n'ont pas été communiqués).
 * Modifiez ces valeurs (en centimes) une fois les tarifs confirmés.
 */
export interface Tarif {
  id: string;
  label: string;
  montantCentimes: number;
}

/** Caution obligatoire, prélevée automatiquement avec la cotisation (remplace l'ancien chèque de caution). */
export const CAUTION_CENTIMES = 10000;

/** Cotisation annuelle — plein tarif ou tarif réduit (étudiant/demandeur d'emploi/salarié Airbus…). */
export const ADHESION_TARIFS: Record<"plein" | "reduit", Tarif> = {
  plein: { id: "adhesion-plein", label: "Adhésion plein tarif (montant à confirmer)", montantCentimes: 25000 },
  reduit: { id: "adhesion-reduit", label: "Adhésion tarif réduit (montant à confirmer)", montantCentimes: 15000 },
};

/** Stages, payables indépendamment de l'adhésion. */
export const STAGE_TARIFS: Tarif[] = [
  { id: "stage-mer-4j", label: "Stage Mer — 4 jours (234 €)", montantCentimes: 23400 },
  { id: "stage-mer-3j", label: "Stage Mer — 3 jours (155 €)", montantCentimes: 15500 },
  { id: "stage-montagne", label: "Stage Montagne — 7 jours (462 €)", montantCentimes: 46200 },
];
