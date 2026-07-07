export interface BureauMembre {
  name: string;
  role: string;
}

export const BUREAU_2026: BureauMembre[] = [
  { name: "Julien Derville", role: "Président" },
  { name: "Erwan Lejean", role: "Trésorier" },
  { name: "Chloé Vermorel", role: "Secrétaire" },
  { name: "Gabriel Messaut", role: "Vie sportive" },
  { name: "Erwan Lejean", role: "Vie sportive" },
  { name: "Nicolas Verdeyme", role: "Inscriptions" },
  { name: "Julien Derville", role: "Inscriptions" },
  { name: "Erwan Lejean", role: "Stages" },
  { name: "Julien Derville", role: "Stages" },
  { name: "Alain Bertrand", role: "Partenaires" },
  { name: "Micael Martins", role: "Sortie club" },
  { name: "Erwan Lejean", role: "Tenues" },
  { name: "Micael Martins", role: "Tenues" },
  { name: "Chloé Vermorel", role: "Communication" },
  { name: "Wilfrid Alias", role: "Membre entrant" },
];

export const PRESIDENT_HONNEUR = {
  name: "Michel",
  description:
    "Co-créateur du club, 25 ans de présidence. Président d'honneur du TOAC Triathlon.",
};

export const COACHS = [
  { name: "Damien", discipline: "Natation" },
  { name: "Moulay M'tir", discipline: "Vélo (suppléé par Erwan Lejean)" },
  { name: "Bénévoles du club", discipline: "Course à pied" },
];

export const PALMARES_2025 = [
  { name: "Yann Dotter", exploit: "Champion Occitanie Duathlon & Triathlon L" },
  { name: "Aurélie Guiral", exploit: "Championne Occitanie Aquathlon" },
  { name: "Serge Rivière", exploit: "Vice-champion Ironman 140.6 Nice" },
  { name: "Isabelle Vernaz", exploit: "Mondiaux Ironman 70.3 Marbella" },
  { name: "Nicolas Verdeyme", exploit: "Mondiaux Swimrun Ötillö" },
  { name: "Julien Dubois", exploit: "Mondiaux Swimrun Ötillö" },
  { name: "Margot Roustan", exploit: "Mondiaux Xterra Italie" },
];
