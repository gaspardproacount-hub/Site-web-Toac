export interface Lieu {
  id: string;
  nom: string;
  adresse: string;
  lat: number;
  lng: number;
  disciplines: string[];
  creneaux: string;
  consignes?: string;
}

export const LIEUX: Lieu[] = [
  {
    id: "jean-boiteux",
    nom: "Piscine Jean Boiteux",
    adresse: "Toulouse",
    lat: 43.6115,
    lng: 1.4225,
    disciplines: ["Natation"],
    creneaux: "Lundi, jeudi, vendredi — 7h00",
  },
  {
    id: "castex",
    nom: "Piscine Castex",
    adresse: "Toulouse",
    lat: 43.6047,
    lng: 1.4442,
    disciplines: ["Natation"],
    creneaux: "Mardi — 21h00",
    consignes:
      "Badger avec le code-barres envoyé par mail/WhatsApp (comptage Mairie pour l'attribution des lignes).",
  },
  {
    id: "capitany",
    nom: "Piste Capitany",
    adresse: "Colomiers",
    lat: 43.6114,
    lng: 1.3306,
    disciplines: ["Course à pied"],
    creneaux: "Lundi, jeudi, vendredi — 12h20",
  },
  {
    id: "arbre-toac",
    nom: "L'arbre du TOAC — Lac de La Ramée",
    adresse: "Tournefeuille",
    lat: 43.5867,
    lng: 1.3444,
    disciplines: ["Vélo"],
    creneaux: "Mercredi — 12h15",
    consignes: "Casque strictement obligatoire.",
  },
  {
    id: "toac",
    nom: "TOAC",
    adresse: "20 chemin de Garric, 31200 Toulouse",
    lat: 43.5804,
    lng: 1.4372,
    disciplines: ["Course à pied", "Musculation", "Vélo (samedi)"],
    creneaux: "Mercredi 18h30 (course) · mardi/jeudi/vendredi/samedi (muscu) · samedi 8h50 (vélo)",
  },
  {
    id: "croix-de-pierre",
    nom: "Pont de la Croix de Pierre",
    adresse: "Allée Fernand Jourdant, Toulouse",
    lat: 43.5877,
    lng: 1.4232,
    disciplines: ["Natation libre"],
    creneaux: "Libre, non encadré",
    consignes: "Le TOAC n'encadre pas et n'est pas responsable de ces sessions.",
  },
];
