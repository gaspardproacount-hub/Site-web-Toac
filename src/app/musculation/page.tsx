import type { Metadata } from "next";
import { Suspense } from "react";
import MusculationDechargeForm from "@/components/MusculationDechargeForm";

// Page pas encore reliée au menu (voir src/lib/nav.ts) — accessible uniquement
// par son URL directe le temps de la tester ; robots: noindex pour éviter
// qu'elle ne soit indexée avant l'ouverture officielle.
export const metadata: Metadata = {
  title: "Musculation",
  description:
    "Salle de musculation du TOAC : créneaux, encadrants, règles d'accès et formulaire de décharge en ligne.",
  robots: { index: false, follow: false },
};

const CRENEAUX = [
  { jour: "Lundi", horaires: "7h – 9h" },
  { jour: "Mardi", horaires: "7h – 9h et 12h45 – 14h" },
  { jour: "Mercredi", horaires: "7h – 9h" },
  { jour: "Jeudi", horaires: "7h – 9h, 13h – 14h et 18h – 19h" },
  { jour: "Samedi", horaires: "9h30 – 11h" },
];

const ENCADRANTS = [
  "François PERRINEAU",
  "Hugo PRÉZELIN",
  "Billton VITUS",
  "Aurélie VANNUTELLI",
  "Anne LARRIBE",
  "Damien MARTINS",
];

const CONDITIONS = [
  "Être au minimum 2 lors de la séance et maximum 12.",
  "Avoir un certificat médical spécifiant son aptitude, sans contre-indication, à la pratique de la musculation (validité 3 ans).",
  "Remplir une décharge envers le TOAC chaque année.",
  "Présence obligatoire d'un encadrant pour gérer la séance et récupérer la clé à la sécurité au poste de garde, en échange d'une carte d'identité ou du badge Airbus.",
];

export default function MusculationPage() {
  return (
    <Suspense fallback={null}>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">Musculation</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="space-y-8 text-sm text-toac-blue-900/90">
            <section>
              <h2 className="font-display text-lg uppercase text-toac-blue-950">Créneaux</h2>
              <ul className="mt-3 divide-y divide-toac-gray-200 rounded-md border border-toac-gray-200 bg-white">
                {CRENEAUX.map((c) => (
                  <li key={c.jour} className="flex justify-between px-4 py-2">
                    <span className="font-medium text-toac-blue-950">{c.jour}</span>
                    <span>{c.horaires}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-toac-blue-900/60">
                Retrouvez le calendrier partagé à jour sur{" "}
                <a
                  href="https://www.idosport.app/calendrier-partage/visualiser/lYzH6pXCPzSlQf-QWn0VoSSvi98/restricted"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-toac-blue-600 underline"
                >
                  IDO
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase text-toac-blue-950">Encadrants</h2>
              <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                {ENCADRANTS.map((nom) => (
                  <li key={nom} className="rounded-md border border-toac-gray-200 bg-white px-3 py-1.5">
                    {nom}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase text-toac-blue-950">Contact du gardien</h2>
              <p className="mt-3 rounded-md border border-toac-gray-200 bg-white px-4 py-3">
                TOAC Gardien —{" "}
                <a href="tel:0647837720" className="text-toac-blue-600 underline">
                  06 47 83 77 20
                </a>
              </p>
            </section>

            <section>
              <h2 className="font-display text-lg uppercase text-toac-blue-950">Conditions préalables</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {CONDITIONS.map((condition) => (
                  <li key={condition}>{condition}</li>
                ))}
              </ul>
            </section>
          </div>

          <div>
            <div className="rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg uppercase text-toac-blue-950">
                Décharge et certificat médical
              </h2>
              <p className="mt-2 text-sm text-toac-blue-900/80">
                Complétez ce formulaire pour générer votre décharge à partir de vos informations et de
                votre signature. Vous pourrez relire le document avant de le valider et de le transmettre,
                avec votre certificat médical, au bureau du club.
              </p>
              <div className="mt-6">
                <MusculationDechargeForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
