import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMusculationDecharges, DatabaseNotConfiguredError, type MusculationDechargeRow } from "@/lib/db";
import AdminMusculationTable from "@/components/AdminMusculationTable";
import DbSetupNotice from "@/components/DbSetupNotice";

export const metadata: Metadata = {
  title: "Vue bureau — Décharges musculation",
  robots: { index: false, follow: false },
};

export default async function BureauMusculationPage() {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/espace-adherents/bureau/musculation");
  if (session.role !== "admin") redirect("/espace-adherents/dossier");

  let decharges: MusculationDechargeRow[];
  let dbError = false;
  try {
    decharges = await getMusculationDecharges();
  } catch (error) {
    if (error instanceof DatabaseNotConfiguredError) {
      dbError = true;
      decharges = [];
    } else {
      throw error;
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Vue bureau — Décharges musculation
      </h1>
      <p className="mt-4 text-toac-blue-900/80">
        Décharges signées et certificats médicaux transmis via la page « Musculation » — un lien devient
        officiel une fois validé (relu et confirmé) par l&apos;adhérent.
      </p>
      <div className="mt-8">
        {dbError ? <DbSetupNotice /> : <AdminMusculationTable decharges={decharges} />}
      </div>
    </div>
  );
}
