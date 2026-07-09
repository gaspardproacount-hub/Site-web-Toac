/**
 * Tarifs d'adhésion 2025-2026, d'après la grille du club (Part club + Part
 * FFTri, licence compétition ou loisir). Le total (club + FFTri) est
 * prélevé en une fois par le site via Monetico. La part FFTri est
 * susceptible de varier de ±5% (grille FFTri définitive non communiquée à
 * ce jour) : ajustez les montants ci-dessous si besoin.
 */
export interface Tarif {
  id: string;
  label: string;
  montantCentimes: number;
}

/** Caution obligatoire, prélevée automatiquement avec la cotisation (remplace l'ancien chèque de caution). Restituée en fin de saison sous réserve d'implication dans l'organisation des Triathlons du Lauragais (6-7 juin 2026). */
export const CAUTION_CENTIMES = 10000;

export type ProfilAdherent = "plein" | "reduit";
export type LicenceType = "competition" | "loisir";

/**
 * plein  = Extérieurs (dont Airbus Central)
 * reduit = Airbus Opérations & ayant droit Airbus Opérations / Chômeurs & Étudiants
 */
export const ADHESION_TARIFS: Record<ProfilAdherent, Record<LicenceType, Tarif>> = {
  plein: {
    competition: {
      id: "adhesion-plein-competition",
      label: "Adhésion plein tarif — licence compétition (250 €)",
      montantCentimes: 25000,
    },
    loisir: {
      id: "adhesion-plein-loisir",
      label: "Adhésion plein tarif — licence loisir (185 €)",
      montantCentimes: 18500,
    },
  },
  reduit: {
    competition: {
      id: "adhesion-reduit-competition",
      label: "Adhésion tarif réduit — licence compétition (200 €)",
      montantCentimes: 20000,
    },
    loisir: {
      id: "adhesion-reduit-loisir",
      label: "Adhésion tarif réduit — licence loisir (135 €)",
      montantCentimes: 13500,
    },
  },
};

/**
 * Assurance FFTRI 2026 (obligatoire, formule au choix de l'adhérent) —
 * voir https://www.fftri.com/pratiquer/se-licencier/assurance/assurance-2026/
 * Ajustez les montants si le barème FFTRI change.
 */
export const ASSURANCE_TARIFS: Tarif[] = [
  { id: "assurance-formule-1", label: "Formule 1 — Responsabilité civile (4,80 €)", montantCentimes: 480 },
  {
    id: "assurance-formule-2",
    label: "Formule 2 — RC + individuelle accident (5,45 €)",
    montantCentimes: 545,
  },
  {
    id: "assurance-formule-3",
    label: "Formule 3 — RC + individuelle accident + assistance + vélo (190,00 €)",
    montantCentimes: 19000,
  },
  { id: "assurance-licence-action", label: "Licence Action (5,00 €)", montantCentimes: 500 },
  { id: "assurance-licence-4-6-ans", label: "Licence 4-6 ans (0,95 €)", montantCentimes: 95 },
];

/** Stages, payables indépendamment de l'adhésion. */
export const STAGE_TARIFS: Tarif[] = [
  { id: "stage-mer-4j", label: "Stage Mer — 4 jours (234 €)", montantCentimes: 23400 },
  { id: "stage-mer-3j", label: "Stage Mer — 3 jours (155 €)", montantCentimes: 15500 },
  { id: "stage-montagne", label: "Stage Montagne — 7 jours (462 €)", montantCentimes: 46200 },
];
