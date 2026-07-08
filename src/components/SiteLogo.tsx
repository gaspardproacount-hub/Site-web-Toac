import Image from "next/image";

/** Affiche le logo du TOAC Triathlon (public/logo-toac.png). */
export default function SiteLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logo-toac.png"
      alt="TOAC Triathlon"
      width={340}
      height={133}
      priority
      className={className}
    />
  );
}
