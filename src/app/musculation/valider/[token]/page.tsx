import type { Metadata } from "next";
import { getMusculationDechargeByToken, DatabaseNotConfiguredError } from "@/lib/db";
import ValiderMusculationDecharge from "@/components/ValiderMusculationDecharge";
import DbSetupNotice from "@/components/DbSetupNotice";
import { documentHref } from "@/lib/documentUrl";

export const metadata: Metadata = {
  title: "Relecture de votre décharge musculation",
  robots: { index: false, follow: false },
};

// L'état du dossier change juste après le clic sur « Valider ce document » :
// la page est rejouée à chaque affichage plutôt que servie depuis un cache.
export const dynamic = "force-dynamic";

const titleClass = "section-title font-display text-3xl uppercase text-toac-blue-950";

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
        <h1 className={titleClass}>Lien introuvable</h1>
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

  // Une fois le document validé, la page ne propose plus rien : elle confirme
  // simplement que le dossier est parti au club.
  if (decharge.statut === "valide") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className={titleClass}>Documents envoyés au TOAC</h1>
        <p className="mt-4 text-lg text-toac-blue-900/80">
          Votre certificat médical et votre décharge ont été envoyés au TOAC Triathlon, vous pouvez
          désormais utiliser la salle de musculation.
        </p>
      </div>
    );
  }

  const pdfHref = documentHref(decharge.decharge_url, decharge.token);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className={titleClass}>Votre décharge salle de musculation</h1>
      <p className="mt-4 text-lg text-toac-blue-900/80">
        Vérifiez le document ci-dessous généré à partir de vos informations
      </p>

      <div className="mt-8 overflow-hidden rounded-md border border-toac-gray-200 bg-toac-gray-50">
        <iframe
          src={pdfHref}
          title="Décharge salle de musculation et certificat médical"
          className="block h-[75vh] min-h-[420px] w-full"
        />
      </div>
      <p className="mt-2 text-xs text-toac-blue-900/60">
        Le document ne s&apos;affiche pas ?{" "}
        <a href={pdfHref} target="_blank" rel="noopener noreferrer" className="text-toac-blue-600 underline">
          Ouvrez-le dans un nouvel onglet
        </a>
        .
      </p>

      <p className="mt-8 text-sm text-toac-blue-900/70">
        Une erreur ? Remplissez à nouveau le{" "}
        <a href="/musculation" className="text-toac-blue-600 underline">
          formulaire
        </a>{" "}
        — un nouveau document remplacera celui-ci une fois validé.
      </p>

      <div className="mt-4">
        <ValiderMusculationDecharge token={decharge.token} />
      </div>
    </div>
  );
}
