import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Adhésion validée",
};

export default function ConfirmationPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-3xl uppercase text-toac-blue-950">Merci !</h1>
      <p className="mt-4 text-toac-blue-900/80">
        Votre paiement a bien été pris en compte, votre inscription est validée. Le bureau du club revient
        vers vous prochainement pour la suite du parcours d&apos;adhésion (licence FFTRI, listes du club…).
      </p>
      <Link
        href="/nous-rejoindre"
        className="mt-8 inline-block rounded-md bg-toac-pink-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-white hover:bg-toac-pink-400"
      >
        Retour à la page d&apos;adhésion
      </Link>
    </div>
  );
}
