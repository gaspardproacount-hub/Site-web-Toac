import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AVANTAGES_PARTENAIRES } from "@/content/partenaires";

export const metadata: Metadata = {
  title: "Avantages partenaires",
  robots: { index: false, follow: false },
};

export default async function AvantagesPage() {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/espace-adherents/avantages");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Avantages partenaires
      </h1>
      <p className="mt-4 text-toac-blue-900/80">
        Réductions réservées aux adhérents du TOAC Triathlon. Présentez votre licence FFTRI mentionnant le
        club lorsque demandé.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {AVANTAGES_PARTENAIRES.map((p) => (
          <div key={p.name} className="rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base uppercase text-toac-blue-950">{p.name}</h2>
            <p className="text-sm text-toac-blue-900/60">{p.ville}</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-toac-blue-900/90">
              {p.avantages.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            {p.conditions && (
              <p className="mt-3 text-xs text-toac-blue-900/60">⚠️ {p.conditions}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
