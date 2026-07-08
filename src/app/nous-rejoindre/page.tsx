import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import AdhesionForm from "@/components/AdhesionForm";
import { STAGE_TARIFS } from "@/content/tarifs";

export const metadata: Metadata = {
  title: "Nous rejoindre",
  description: "Adhérer au TOAC Triathlon : parcours d'adhésion, paiement en ligne sécurisé Monetico.",
};

const ETAPES = [
  "Remplir le formulaire d'adhésion et payer en ligne (cotisation + caution, paiement sécurisé Monetico)",
  "Demande de licence FFTRI",
  "Rejoindre les listes Google et la communauté WhatsApp du club",
  "Commander sa trifonction TOAC",
];

export default function NousRejoindrePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">Nous rejoindre</h1>
      <p className="mt-4 text-toac-blue-900/80">
        Nouvelles adhésions : merci de prendre contact avec le bureau avant de finaliser votre inscription.
      </p>

      <ol className="mt-10 space-y-4">
        {ETAPES.map((etape, i) => (
          <li key={etape} className="flex items-start gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-toac-blue-950 font-display text-sm text-toac-pink-400">
              {i + 1}
            </span>
            <span className="pt-1 text-toac-blue-900/90">{etape}</span>
          </li>
        ))}
      </ol>

      <section className="mt-14 rounded-lg border border-toac-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl uppercase text-toac-blue-950">
          Formulaire d&apos;adhésion et paiement
        </h2>
        <p className="mt-2 text-sm text-toac-blue-900/70">
          Un seul formulaire : vos informations, le tarif (plein ou réduit) et le paiement (cotisation +
          caution de bénévolat, prélevés ensemble). Votre inscription est enregistrée immédiatement et
          validée automatiquement dès que le paiement est confirmé.
        </p>
        <div className="mt-6">
          <AdhesionForm />
        </div>
      </section>

      <section className="mt-14 rounded-lg border border-toac-gray-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl uppercase text-toac-blue-950">
          Payer un stage (Mer, Montagne…)
        </h2>
        <p className="mt-2 text-sm text-toac-blue-900/70">
          Pour un stage uniquement, sans lien avec l&apos;adhésion. Paiement sécurisé Monetico.
        </p>

        <form action="/api/monetico/init" method="POST" className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-toac-blue-900">
              Votre email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
            />
          </div>
          <div>
            <label htmlFor="montantCentimes" className="mb-1 block text-sm font-medium text-toac-blue-900">
              Stage
            </label>
            <select
              id="montantCentimes"
              name="montantCentimes"
              required
              className="w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
            >
              {STAGE_TARIFS.map((t) => (
                <option key={t.id} value={t.montantCentimes}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-toac-pink-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400 sm:w-auto"
          >
            Payer le stage en ligne
          </button>
        </form>
        <p className="mt-3 text-xs text-toac-blue-900/60">
          Le paiement nécessite que les variables d'environnement MONETICO_TPE, MONETICO_CODE_SOCIETE,
          MONETICO_CLE_HMAC et MONETICO_URL_RETOUR soient configurées (voir .env.example et le README).
        </p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-xl uppercase text-toac-blue-950">
          Contacter le bureau / préinscription
        </h2>
        <p className="mt-2 text-sm text-toac-blue-900/70">
          Un formulaire simple pour prendre contact avant votre adhésion.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
