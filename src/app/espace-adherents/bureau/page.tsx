import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMembers } from "@/lib/data-store";
import AdminMembersTable from "@/components/AdminMembersTable";

export const metadata: Metadata = {
  title: "Vue bureau — Dossiers adhérents",
  robots: { index: false, follow: false },
};

export default async function BureauDossiersPage() {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/espace-adherents/bureau");
  if (session.role !== "admin") redirect("/espace-adherents/dossier");

  const members = getMembers();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Vue bureau — Dossiers adhérents
      </h1>
      <p className="mt-4 text-toac-blue-900/80">
        Tableau complet des dossiers adhérents (données factices tant que le CSV du club n&apos;a pas été
        importé — voir README).
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/espace-adherents/bureau/commandes"
          className="rounded-md border border-toac-blue-800 px-4 py-2 text-sm font-medium text-toac-blue-950 hover:bg-toac-blue-950 hover:text-white"
        >
          Commandes Monetico →
        </Link>
        <Link
          href="/espace-adherents/bureau/inscriptions"
          className="rounded-md border border-toac-blue-800 px-4 py-2 text-sm font-medium text-toac-blue-950 hover:bg-toac-blue-950 hover:text-white"
        >
          Demandes d&apos;adhésion →
        </Link>
      </div>

      <div className="mt-8">
        <AdminMembersTable members={members} />
      </div>
    </div>
  );
}
