import type { Metadata } from "next";
import { getMusculationDechargeByToken, DatabaseNotConfiguredError } from "@/lib/db";
import ValiderMusculationDecharge from "@/components/ValiderMusculationDecharge";
import { documentHref } from "@/lib/documentUrl";
import DbSetupNotice from "@/components/DbSetupNotice";

export const metadata: Metadata = {
  title: "Relecture de votre décharge musculation",
  robots: { index: false, follow: false },
};

export default async function ValiderMusculationDechargePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let decharge;
  try {
    decharge = await getMusculationDechargeByToken(token);
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <DbSetupNotice />
        </div>
      );
    }
    throw error;
  }

  if (!decharge) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
          Lien introuvable
        </h1>
        <p className="mt-4 text-toac-blue-900/80">
          Ce lien de relecture n&apos;est pas valide. Remplissez à nouveau le{" "}
          <a href="/musculation" className="text-toac-blue-600 underline">
            formulaire de décharge musculation
          </a>{" "}
          pour en générer un nouveau.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Relisez votre décharge avant envoi
      </h1>
      <p className="mt-4 text-toac-blue-900/80">
        Vérifiez le document généré à partir de vos informations et votre certificat médical avant de
        les transmettre au bureau du club.
      </p>

      <div className="mt-8 space-y-4">
        <div className="rounded-md border border-toac-gray-200 bg-white p-4">
          <p className="font-medium text-toac-blue-950">
            {decharge.prenom} {decharge.nom}
          </p>
          <p className="mt-1 text-sm text-toac-blue-900/80">
            {decharge.adresse}, {decharge.code_postal} {decharge.ville}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={documentHref(decharge.decharge_url, decharge.token)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-toac-blue-800 px-4 py-2 text-sm font-medium text-toac-blue-950 hover:bg-toac-blue-950 hover:text-white"
          >
            Voir la décharge générée (PDF) →
          </a>
          <a
            href={documentHref(decharge.certificat_url, decharge.token)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-toac-blue-800 px-4 py-2 text-sm font-medium text-toac-blue-950 hover:bg-toac-blue-950 hover:text-white"
          >
            Voir le certificat médical →
          </a>
        </div>

        <p className="text-xs text-toac-blue-900/60">
          Une erreur ? Remplissez à nouveau le{" "}
          <a href="/musculation" className="text-toac-blue-600 underline">
            formulaire
          </a>{" "}
          — un nouveau document remplacera celui-ci une fois validé.
        </p>

        <div className="pt-2">
          <ValiderMusculationDecharge token={decharge.token} dejaValidee={decharge.statut === "valide"} />
        </div>
      </div>
    </div>
  );
}
