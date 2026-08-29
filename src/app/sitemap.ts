import type { MetadataRoute } from "next";

const SITE_URL = "https://www.toac-triathlon.com";

const ROUTES = [
  "",
  "/le-club",
  "/le-club/bureau",
  "/le-club/vie-du-club",
  "/le-club/partenaires",
  "/entrainements",
  "/entrainements/points-de-rdv",
  "/triathlons-du-lauragais",
  "/faq",
  "/nous-rejoindre",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
  "/reglement-interieur",
  "/arbitrage",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
