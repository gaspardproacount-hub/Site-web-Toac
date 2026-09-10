import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";

// La page /connexion est un composant client : elle ne peut pas exporter de
// `metadata`. Sans ce layout elle hériterait du titre et de la description de
// l'accueil, ce qui crée un doublon dans les audits SEO.
export const metadata: Metadata = privatePageMetadata("Connexion");

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
