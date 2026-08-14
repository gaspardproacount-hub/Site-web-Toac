import type { NextConfig } from "next";

// URL Vercel générée automatiquement pour ce projet : on la garde hors des
// index de recherche (le vrai domaine public est toac-triathlon.com).
const VERCEL_APP_HOST = "site-web-toac.vercel.app";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/entrainements/ou-et-quand",
        destination: "/entrainements/points-de-rdv",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: VERCEL_APP_HOST }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
