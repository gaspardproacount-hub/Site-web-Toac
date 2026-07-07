export interface NavLink {
  label: string;
  href: string;
  protected?: boolean;
}

export interface NavItem {
  label: string;
  href?: string;
  children?: NavLink[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Accueil", href: "/" },
  {
    label: "Le Club",
    href: "/le-club",
    children: [
      { label: "À propos / Notre histoire", href: "/le-club" },
      { label: "Le bureau & les coachs", href: "/le-club/bureau" },
      { label: "La vie du club", href: "/le-club/vie-du-club" },
      { label: "Nos partenaires", href: "/le-club/partenaires" },
    ],
  },
  {
    label: "Entraînements",
    href: "/entrainements",
    children: [
      { label: "Planning de la semaine", href: "/entrainements" },
      { label: "Où & Quand", href: "/entrainements/ou-et-quand" },
    ],
  },
  { label: "Triathlons du Lauragais", href: "/triathlons-du-lauragais" },
  { label: "FAQ", href: "/faq" },
  { label: "Nous rejoindre", href: "/nous-rejoindre" },
  {
    label: "Espace Adhérents",
    href: "/espace-adherents/dossier",
    children: [
      { label: "Suivi de mon dossier", href: "/espace-adherents/dossier", protected: true },
      { label: "Documents & infos internes", href: "/espace-adherents/documents", protected: true },
      { label: "Avantages partenaires", href: "/espace-adherents/avantages", protected: true },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_SITEMAP: NavLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Le Club", href: "/le-club" },
  { label: "Entraînements", href: "/entrainements" },
  { label: "Triathlons du Lauragais", href: "/triathlons-du-lauragais" },
  { label: "FAQ", href: "/faq" },
  { label: "Nous rejoindre", href: "/nous-rejoindre" },
  { label: "Contact", href: "/contact" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/confidentialite" },
];
