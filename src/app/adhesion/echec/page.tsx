import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Échec du paiement",
};

export default function EchecPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl uppercase text-toac-blue-950">Le paiement a échoué</h1>
      <p className="mt-4 text-toac-blue-900/80">
        Votre paiement n&apos;a pas pu être validé. Aucune somme n&apos;a été débitée. Vous pouvez réessayer
        ou contacter le bureau si le problème persiste.
      </p>
      <Link
        href="/nous-rejoindre"
        className="mt-8 inline-block rounded-md bg-toac-pink-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-white hover:bg-toac-pink-400"
      >
        Réessayer
      </Link>
    </div>
  );
}
