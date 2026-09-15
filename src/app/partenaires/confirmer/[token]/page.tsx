import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import { getPartnerSignupByToken, DatabaseNotConfiguredError } from "@/lib/db";
import ConfirmerPartenaireAjout from "@/components/ConfirmerPartenaireAjout";
import DbSetupNotice from "@/components/DbSetupNotice";

export const metadata: Metadata = privatePageMetadata("Confirmer un ajout partenaire");

// Le statut change juste après le clic sur « Confirmer l'ajout » : la page
// est rejouée à chaque affichage plutôt que servie depuis un cache.
export const dynamic = "force-dynamic";

const titleClass = "section-title font-display text-3xl uppercase text-toac-blue-950";

const PARTNER_LABELS: Record<string, string> = {
  alltricks: "Alltricks",
};

export default async function ConfirmerPartenairePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  let signup;
  try {
    signup = await getPartnerSignupByToken(token);
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

  if (!signup) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className={titleClass}>Lien introuvable</h1>
        <p className="mt-4 text-toac-blue-900/80">Ce lien de confirmation n&apos;est pas valide.</p>
      </div>
    );
  }

  const label = PARTNER_LABELS[signup.partenaire] ?? signup.partenaire;

  if (signup.statut === "ajoute") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className={titleClass}>Déjà confirmé</h1>
        <p className="mt-4 text-toac-blue-900/80">
          {signup.prenom} {signup.nom} a déjà été confirmé(e) comme ajouté(e) sur le compte {label}, et en a
          été informé(e) par email.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className={titleClass}>Confirmer l&apos;ajout — {label}</h1>
      <p className="mt-4 text-toac-blue-900/80">
        Confirmez que cet adhérent a bien été ajouté sur le compte {label} du club. Un email lui sera
        automatiquement envoyé pour l&apos;en informer.
      </p>

      <dl className="mt-6 grid gap-x-6 gap-y-2 rounded-md border border-toac-gray-200 bg-toac-gray-50 p-4 text-sm sm:grid-cols-2">
        <div><dt className="text-toac-blue-900/60">Nom</dt><dd className="font-medium">{signup.nom}</dd></div>
        <div><dt className="text-toac-blue-900/60">Prénom</dt><dd className="font-medium">{signup.prenom}</dd></div>
        <div className="sm:col-span-2">
          <dt className="text-toac-blue-900/60">Email</dt>
          <dd className="font-medium">{signup.email}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <ConfirmerPartenaireAjout token={signup.token ?? token} />
      </div>
    </div>
  );
}
