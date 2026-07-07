import { LOGO_DATA_URI } from "@/lib/logo";

/**
 * Affiche le logo du TOAC Triathlon. Le logo est embarqué dans le code
 * (data URI) — voir src/lib/logo.ts — donc il s'affiche toujours, sans
 * dépendre d'un fichier image externe.
 */
export default function SiteLogo({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_DATA_URI} alt="TOAC Triathlon" className={className} />
  );
}
