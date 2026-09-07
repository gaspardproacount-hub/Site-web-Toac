import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pré-inscription enregistrée",
};

export default function PreinscriptionConfirmationPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl uppercase text-toac-blue-950">Merci !</h1>
      <p className="mt-4 text-toac-blue-900/80">
        Votre pré-inscription est enregistrée. Le bureau du club revient vers vous pour la suite du
        parcours : demande de licence FFTRI (à partir du 1er septembre 2026), validation par le club, puis
        paiement de la cotisation.
      </p>
      <Link
        href="/adhesion"
        className="mt-8 inline-block rounded-md bg-toac-pink-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-white hover:bg-toac-pink-400"
      >
        Retour à la page d&apos;adhésion
      </Link>
    </div>
  );
}
