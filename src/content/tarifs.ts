/**
 * Tarifs 2025-2026 — repris exactement du catalogue produits configuré dans
 * l'espace Monetico Online Asso du club (monetico-online-asso.com), pour
 * que le total calculé sur le site corresponde toujours à la somme des
 * "produits" réels côté Monetico. Le total (adhésion + licence + assurance
 * + caution) est prélevé en une fois via le formulaire d'adhésion.
 *
 * Si vous modifiez un prix côté Monetico Online Asso (menu Gestion de la
 * page de commande), reportez le même montant ici.
 */
export interface Tarif {
  id: string;
  label: string;
  montantCentimes: number;
}

/** Produit Monetico "Caution bénévolat (Toac)" — restituée en fin de saison sous réserve d'implication dans l'organisation des Triathlons du Lauragais (6-7 juin 2026). */
export const CAUTION_CENTIMES = 10000;

export type ProfilAdherent = "plein" | "reduit";
export type LicenceType = "competition" | "loisir";

/**
 * Produits "Adhésion club (…)" — Part club uniquement (sans la licence
 * FFTri, facturée séparément ci-dessous).
 * plein  = Extérieurs (dont Airbus Central)
 * reduit = Airbus Opérations & ayant droit Airbus Opérations / Chômeurs & Étudiants
 */
export const ADHESION_CLUB_TARIFS: Record<ProfilAdherent, Tarif> = {
  plein: { id: "adhesion-club-plein", label: "Adhésion club (plein tarif)", montantCentimes: 14500 },
  reduit: { id: "adhesion-club-reduit", label: "Adhésion club (tarif réduit)", montantCentimes: 9500 },
};

/**
 * Produits "Licence FFTri (…)". Le tarif compétition (1 €) est un
 * placeholder côté Monetico en attendant la grille FFTRI définitive —
 * mettez à jour dès qu'elle est communiquée.
 */
export const LICENCE_FFTRI_TARIFS: Record<LicenceType, Tarif> = {
  loisir: { id: "licence-fftri-loisir", label: "Licence FFTri (loisir)", montantCentimes: 4000 },
  competition: {
    id: "licence-fftri-competition",
    label: "Licence FFTri (compétition)",
    montantCentimes: 100,
  },
};

/** Produits "Assurance FFTri (Formule …)", + option "aucune" pour ceux qui ont déjà une assurance équivalente par ailleurs. */
export const ASSURANCE_TARIFS: Tarif[] = [
  { id: "assurance-aucune", label: "Aucune assurance FFTri", montantCentimes: 0 },
  { id: "assurance-formule-1", label: "Assurance FFTri (Formule 1)", montantCentimes: 480 },
  { id: "assurance-formule-2", label: "Assurance FFTri (Formule 2)", montantCentimes: 545 },
  { id: "assurance-formule-3", label: "Assurance FFTri (Formule 3)", montantCentimes: 19000 },
];

/** Stages, payables indépendamment de l'adhésion. */
export const STAGE_TARIFS: Tarif[] = [
  { id: "stage-mer-4j", label: "Stage Mer — 4 jours (234 €)", montantCentimes: 23400 },
  { id: "stage-mer-3j", label: "Stage Mer — 3 jours (155 €)", montantCentimes: 15500 },
  { id: "stage-montagne", label: "Stage Montagne — 7 jours (462 €)", montantCentimes: 46200 },
];
