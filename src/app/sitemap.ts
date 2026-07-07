import type { MetadataRoute } from "next";

const SITE_URL = "https://toac-triathlon.example.com";

const ROUTES = [
  "",
  "/le-club",
  "/le-club/bureau",
  "/le-club/vie-du-club",
  "/le-club/partenaires",
  "/entrainements",
  "/entrainements/ou-et-quand",
  "/triathlons-du-lauragais",
  "/faq",
  "/nous-rejoindre",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));
}
