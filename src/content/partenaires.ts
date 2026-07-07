export interface Partenaire {
  name: string;
  specialite: string;
  ville: string;
}

export const PARTENAIRES: Partenaire[] = [
  { name: "Foulées Toulouse", specialite: "Running", ville: "Balma" },
  { name: "Vertical Bike", specialite: "Vélo", ville: "Muret" },
  { name: "Cryo Sud", specialite: "Récupération", ville: "Toulouse" },
  { name: "Alltricks", specialite: "Vélo / Running en ligne", ville: "Escalquens" },
  { name: "Trek", specialite: "Vélo", ville: "Cornebarrieu" },
];

export const PARTENAIRES_INSTITUTIONNELS = [
  "TOAC Omnisports",
  "FFTRI",
  "Ligue Occitanie de Triathlon",
  "Mairie de Toulouse",
  "Conseil Départemental",
];

/**
 * Détail des avantages adhérents — réservé à l'espace adhérents, jamais
 * affiché sur la page publique "Nos partenaires".
 */
export interface AvantagePartenaire {
  name: string;
  ville: string;
  avantages: string[];
  conditions?: string;
}

export const AVANTAGES_PARTENAIRES: AvantagePartenaire[] = [
  {
    name: "Foulées Toulouse",
    ville: "Balma",
    avantages: [
      "-25 % sur le textile",
      "-20 % sur les chaussures",
      "-20 % sur les accessoires & triathlon",
      "-10 % sur la nutrition & l'électronique",
    ],
    conditions: "Hors soldes et promotions en cours.",
  },
  {
    name: "Vertical Bike",
    ville: "Muret",
    avantages: [
      "-15 % sur les vélos Giant/LIV",
      "-50 % sur les études posturales (hors Canyon)",
      "-20 % sur la nutrition",
      "Forfait révision à 50 €",
      "Jusqu'à -30 % sur certains équipements en commande groupée",
    ],
  },
  {
    name: "Cryo Sud",
    ville: "Toulouse",
    avantages: ["Séance de cryothérapie à 20 € au lieu de 34,50 €"],
  },
  {
    name: "Alltricks",
    ville: "Escalquens / alltricks.fr",
    avantages: [
      "-5 % sur le site et en magasins",
      "-10 % sur LeBram / NEATT / SCAMP / Bicyklet",
      "-15 % sur le rayon running",
      "Étude de remise jusqu'à -15 % sur les vélos complets (sur devis)",
    ],
    conditions: "Nécessite votre consentement pour transmettre votre email au partenaire.",
  },
  {
    name: "Trek",
    ville: "Cornebarrieu",
    avantages: [
      "-15 % sur les vélos & accessoires de plus de 1 500 €",
      "-10 % sur les vélos & accessoires de moins de 1 500 €",
      "-5 % sur les articles déjà en promotion",
      "-10 % sur pièces, accessoires, nutrition et électronique",
    ],
    conditions: "Sur présentation de la licence FFTRI mentionnant le TOAC Triathlon.",
  },
];
