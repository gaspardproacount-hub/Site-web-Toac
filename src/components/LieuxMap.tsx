"use client";

import { useEffect, useRef } from "react";
import type { Lieu } from "@/content/lieux";
import "leaflet/dist/leaflet.css";

export default function LieuxMap({ lieux }: { lieux: Lieu[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      // Les icônes par défaut de Leaflet référencent des chemins relatifs qui
      // ne se résolvent pas avec les bundlers modernes : on pointe vers le CDN.
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current).setView([43.6, 1.42], 11);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      lieux.forEach((lieu) => {
        L.marker([lieu.lat, lieu.lng])
          .addTo(map)
          .bindPopup(
            `<strong>${lieu.nom}</strong><br/>${lieu.adresse}<br/><em>${lieu.creneaux}</em>`
          );
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lieux]);

  return <div ref={containerRef} className="h-[420px] w-full rounded-lg border border-toac-gray-200" />;
}
