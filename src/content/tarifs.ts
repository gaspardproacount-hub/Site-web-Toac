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

export const TARIFS: Tarif[] = [
  { id: "adulte", label: "Cotisation adulte (montant à confirmer)", montantCentimes: 25000 },
  { id: "reduit", label: "Cotisation tarif réduit (montant à confirmer)", montantCentimes: 15000 },
  { id: "stage-mer-4j", label: "Stage Mer — 4 jours (234 €)", montantCentimes: 23400 },
  { id: "stage-mer-3j", label: "Stage Mer — 3 jours (155 €)", montantCentimes: 15500 },
  { id: "stage-montagne", label: "Stage Montagne — 7 jours (462 €)", montantCentimes: 46200 },
]
;
