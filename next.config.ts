import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/entrainements/ou-et-quand",
        destination: "/entrainements/points-de-rdv",
        permanent: true,
      },
      {
        source: "/ou-et-quand",
        destination: "/entrainements/points-de-rdv",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
