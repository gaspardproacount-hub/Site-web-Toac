export interface Actualite {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export const ACTUALITES: Actualite[] = [
  {
    slug: "stage-mer-2026",
    title: "Inscriptions ouvertes pour le Stage Mer 2026 à Argelès-sur-Mer",
    date: "2026-01-15",
    excerpt:
      "Du 3 au 7 avril 2026, rejoignez 75 Toacistes pour 4 jours de sport et de convivialité au bord de la Méditerranée.",
  },
  {
    slug: "triathlons-du-lauragais-15e-edition",
    title: "15e édition des Triathlons du Lauragais : objectif 1200 coureurs",
    date: "2026-01-05",
    excerpt:
      "Rendez-vous les 6 et 7 juin 2026 à Nailloux pour la nouvelle édition, avec formats XS à L, swimrun et épreuves jeunes.",
  },
  {
    slug: "bureau-2026",
    title: "Le nouveau bureau 2026 du TOAC Triathlon",
    date: "2025-12-10",
    excerpt:
      "Julien Derville prend la présidence, entouré d'une équipe renouvelée pour piloter la saison 2026.",
  },
];
