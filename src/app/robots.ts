import type { MetadataRoute } from "next";

const SITE_URL = "https://www.toac-triathlon.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/espace-adherents", "/connexion", "/api"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
