import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMemberById, DatabaseNotConfiguredError } from "@/lib/db";
import DossierChecklist, { dossierCompletion } from "@/components/DossierChecklist";
import { getCmsPageBlocks } from "@/lib/cms";
import { CmsEditableText } from "@/components/cms-edit";

export const metadata: Metadata = {
  title: "Suivi de mon dossier",
  robots: { index: false, follow: false },
};

export default async function DossierPage() {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/espace-adherents/dossier");

  let member = null;
  let dbError = false;
  if (session.memberId) {
    try {
      member = await getMemberById(session.memberId);
    } catch (error) {
      if (error instanceof DatabaseNotConfiguredError) {
        dbError = true;
      } else {
        throw error;
      }
    }
  }

  const introBlocks = await getCmsPageBlocks("espace-dossier");
  const introBlock = introBlocks?.[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      {introBlock ? (
        <CmsEditableText
          as="h1"
          value={introBlock.heading || "Suivi de mon dossier"}
          target={{ kind: "block", id: introBlock.id, field: "heading" }}
          className="section-title block font-display text-3xl uppercase text-toac-blue-950"
        />
      ) : (
        <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
          Suivi de mon dossier
        </h1>
      )}
      <p className="mt-4 text-toac-blue-900/80">Bonjour {session.name}.</p>

      {session.role === "admin" && (
        <div className="mt-4 rounded-md border border-toac-blue-600/30 bg-toac-blue-50 p-4 text-sm">
          Vous êtes connecté avec un rôle bureau.{" "}
          <Link href="/espace-adherents/bureau" className="font-medium text-toac-blue-700 underline">
            Accéder à la vue bureau (tous les dossiers) →
          </Link>
        </div>
      )}

      {dbError && (
        <p className="mt-8 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Le suivi des dossiers n&apos;est pas encore configuré côté serveur. Contactez le bureau.
        </p>
      )}

      {!dbError && !member && (
        <p className="mt-8 rounded-md border border-toac-gray-200 bg-toac-gray-50 p-4 text-sm text-toac-blue-900/70">
          Aucun dossier n&apos;est associé à ce compte pour le moment. Contactez le bureau si vous pensez
          qu&apos;il s&apos;agit d&apos;une erreur.
        </p>
      )}

      {member && (
        <div className="mt-8 rounded-lg border border-toac-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-toac-blue-950">
                {member.firstName} {member.lastName}
              </div>
              <div className="text-sm text-toac-blue-900/60">{member.email}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl text-toac-blue-950">
                {dossierCompletion(member.dossier)}%
              </div>
              <div className="text-xs text-toac-blue-900/60">complété</div>
            </div>
          </div>
          <DossierChecklist dossier={member.dossier} />
        </div>
      )}
    </div>
  );
}
