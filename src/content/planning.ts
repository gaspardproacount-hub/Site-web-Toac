export type Discipline = "natation" | "velo" | "course" | "muscu";

export interface Creneau {
  jour: string;
  heure: string;
  discipline: Discipline;
  lieu: string;
  detail?: string;
}

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  natation: "Natation",
  velo: "Vélo",
  course: "Course à pied",
  muscu: "Musculation",
};

export const DISCIPLINE_COLORS: Record<Discipline, string> = {
  natation: "bg-sky-100 text-sky-800 border-sky-300",
  velo: "bg-orange-100 text-orange-800 border-orange-300",
  course: "bg-green-100 text-green-800 border-green-300",
  muscu: "bg-purple-100 text-purple-800 border-purple-300",
};

// Étiquette courte affichée dans les blocs compacts de la grille horaire
// (façon tableau d'occupation de salle) — le libellé complet reste utilisé
// partout ailleurs (légende, cases à cocher, blocs détaillés).
export const DISCIPLINE_SHORT_LABELS: Record<Discipline, string> = {
  natation: "Natation",
  velo: "Vélo",
  course: "CAP",
  muscu: "Muscu",
};

// Info-bulle affichée à côté de l'étiquette courte quand elle est une
// abréviation qui mérite d'être explicitée (ex. "CAP" → "Course à pied").
export const DISCIPLINE_TOOLTIPS: Partial<Record<Discipline, string>> = {
  course: "Course à pied",
};

export const PLANNING: Creneau[] = [
  { jour: "Lundi", heure: "7h00", discipline: "natation", lieu: "Piscine Jean Boiteux", detail: "Coach Damien" },
  { jour: "Lundi", heure: "12h20", discipline: "course", lieu: "Piste Capitany (Colomiers)" },
  { jour: "Mardi", heure: "12h45", discipline: "muscu", lieu: "TOAC", detail: "Décharge signée requise" },
  { jour: "Mardi", heure: "21h00", discipline: "natation", lieu: "Piscine Castex", detail: "Badger avec le code-barres reçu par mail/WhatsApp" },
  { jour: "Mercredi", heure: "12h15", discipline: "velo", lieu: "L'arbre du TOAC, lac de La Ramée (Tournefeuille)", detail: "Coach Moulay M'tir · casque obligatoire" },
  { jour: "Mercredi", heure: "18h30", discipline: "course", lieu: "TOAC" },
  { jour: "Jeudi", heure: "7h00", discipline: "natation", lieu: "Piscine Jean Boiteux", detail: "Coach Damien" },
  { jour: "Jeudi", heure: "12h20", discipline: "course", lieu: "Piste Capitany (Colomiers)" },
  { jour: "Jeudi", heure: "13h00", discipline: "muscu", lieu: "TOAC", detail: "Décharge signée requise" },
  { jour: "Jeudi", heure: "18h00", discipline: "muscu", lieu: "TOAC", detail: "Décharge signée requise" },
  { jour: "Vendredi", heure: "7h00", discipline: "natation", lieu: "Piscine Jean Boiteux", detail: "Coach Damien" },
  { jour: "Vendredi", heure: "12h20", discipline: "course", lieu: "Piste Capitany (Colomiers)" },
  { jour: "Vendredi", heure: "20h00", discipline: "muscu", lieu: "TOAC", detail: "Décharge signée requise" },
  { jour: "Samedi", heure: "8h50", discipline: "velo", lieu: "Site du TOAC", detail: "Encadré par des bénévoles · casque obligatoire" },
  { jour: "Samedi", heure: "9h30", discipline: "muscu", lieu: "TOAC", detail: "Décharge signée requise" },
];

export const JOURS_ORDER = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
