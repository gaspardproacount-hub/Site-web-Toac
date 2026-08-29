import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

const LIENS_UTILES = [
  { href: "/", label: "Accueil" },
  { href: "/adhesion", label: "Nous rejoindre" },
  { href: "/entrainements", label: "Entraînements" },
  { href: "/triathlons-du-lauragais", label: "Triathlons du Lauragais" },
  { href: "/le-club", label: "Le club" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="font-display text-6xl uppercase text-toac-blue-950">404</p>
      <h1 className="mt-4 font-display text-2xl uppercase text-toac-blue-950">
        Cette page n&apos;existe pas (ou plus)
      </h1>
      <p className="mt-4 text-toac-blue-900/80">
        Le site du TOAC Triathlon a été refait et certaines anciennes adresses ont changé. Voici les pages
        les plus utiles pour retrouver votre chemin :
      </p>
      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        {LIENS_UTILES.map((lien) => (
          <li key={lien.href}>
            <Link
              href={lien.href}
              className="inline-block rounded-full border border-toac-blue-950/20 px-5 py-2 text-sm font-semibold text-toac-blue-950 transition hover:bg-toac-blue-950 hover:text-white"
            >
              {lien.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
