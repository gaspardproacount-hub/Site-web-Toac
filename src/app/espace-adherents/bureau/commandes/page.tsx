import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCommandes, DatabaseNotConfiguredError, type CommandeRow } from "@/lib/db";
import AdminCommandesTable from "@/components/AdminCommandesTable";
import DbSetupNotice from "@/components/DbSetupNotice";

export const metadata: Metadata = {
  title: "Vue bureau — Commandes Monetico",
  robots: { index: false, follow: false },
};

export default async function BureauCommandesPage() {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/espace-adherents/bureau/commandes");
  if (session.role !== "admin") redirect("/espace-adherents/dossier");

  let commandes: CommandeRow[];
  let dbError = false;
  try {
    commandes = await getCommandes();
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      dbError = true;
      commandes = [];
    } else {
      throw error;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Vue bureau — Commandes Monetico
      </h1>
      <p className="mt-4 text-toac-blue-900/80">
        Chaque paiement en ligne (notification Monetico) est enregistré automatiquement ici — plus besoin
        d&apos;ouvrir l&apos;email et le fichier Excel envoyés par Monetico.
      </p>
      <div className="mt-8">
        {dbError ? <DbSetupNotice /> : <AdminCommandesTable commandes={commandes} />}
      </div>
    </div>
  );
}
