"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { MusculationDechargeRow } from "@/lib/db";
import { documentHref } from "@/lib/documentUrl";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente de validation par l'adhérent",
  valide: "Validée",
};

const STATUT_CLASSES: Record<string, string> = {
  en_attente: "bg-amber-100 text-amber-800",
  valide: "bg-green-100 text-green-800",
};

export default function AdminMusculationTable({ decharges }: { decharges: MusculationDechargeRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Un dossier est créé dès l'envoi du formulaire, avant que l'adhérent ait relu
  // et validé son document. Ces dossiers en attente ne sont pas des documents
  // transmis au club : ils encombrent la liste, mais restent affichables pour
  // pouvoir relancer l'adhérent ou supprimer un essai abandonné.
  const [showPending, setShowPending] = useState(false);

  const pendingCount = useMemo(
    () => decharges.filter((d) => d.statut !== "valide").length,
    [decharges]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return decharges.filter((d) => {
      if (!showPending && d.statut !== "valide") return false;
      if (!query) return true;
      return `${d.prenom} ${d.nom}`.toLowerCase().includes(query);
    });
  }, [decharges, search, showPending]);

  async function copyReviewLink(d: MusculationDechargeRow) {
    const url = `${window.location.origin}/musculation/valider/${d.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(d.id);
      setTimeout(() => setCopiedId((current) => (current === d.id ? null : current)), 2000);
    } catch {
      window.prompt("Copiez ce lien :", url);
    }
  }

  /**
   * Suppression définitive : le dossier et ses deux fichiers disparaissent. Sert
   * au ménage des essais comme aux demandes d'effacement (RGPD), d'où la
   * confirmation explicite avant l'appel.
   */
  async function handleDelete(d: MusculationDechargeRow) {
    const confirmed = window.confirm(
      `Supprimer définitivement le dossier de ${d.prenom} ${d.nom} ?\n\n` +
        "La décharge et le certificat médical seront effacés. Cette action est irréversible."
    );
    if (!confirmed) return;

    setDeletingId(d.id);
    setDeleteError(null);

    let response: Response;
    try {
      response = await fetch("/api/musculation/decharge/supprimer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: d.id }),
      });
    } catch {
      setDeleteError("Erreur réseau. Réessayez plus tard.");
      setDeletingId(null);
      return;
    }

    const data = await response.json().catch(() => null);
    setDeletingId(null);
    if (!response.ok) {
      setDeleteError(data?.error ?? "La suppression a échoué. Réessayez plus tard.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{decharges.length}</div>
          <div className="text-xs text-toac-blue-900/60">décharges reçues</div>
        </div>
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">
            {decharges.filter((d) => d.statut === "valide").length}
          </div>
          <div className="text-xs text-toac-blue-900/60">validées par l&apos;adhérent</div>
        </div>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un nom…"
        className="mb-3 w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
      />

      <label className="mb-4 flex items-center gap-2 text-sm text-toac-blue-900/80">
        <input
          type="checkbox"
          checked={showPending}
          onChange={(e) => setShowPending(e.target.checked)}
        />
        Afficher aussi les dossiers en attente de validation
        {pendingCount > 0 && ` (${pendingCount})`}
      </label>

      <div className="space-y-3">
        {filtered.map((d) => (
          <div key={d.id} className="rounded-lg border border-toac-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setExpanded(expanded === d.id ? null : d.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div>
                <div className="font-medium text-toac-blue-950">
                  {d.prenom} {d.nom}
                </div>
                <div className="mt-1 text-xs text-toac-blue-900/60">
                  Reçue le {formatDate(d.recue_le)}
                  {d.statut === "valide" && ` · Validée le ${formatDate(d.valide_le)}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_CLASSES[d.statut] ?? "bg-toac-gray-100 text-toac-blue-900"}`}
                >
                  {STATUT_LABELS[d.statut] ?? d.statut}
                </span>
                <span aria-hidden="true" className="text-toac-blue-900/50">
                  {expanded === d.id ? "▲" : "▼"}
                </span>
              </div>
            </button>
            {expanded === d.id && (
              <div className="border-t border-toac-gray-100 px-4 py-4 text-sm">
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  <div><dt className="text-toac-blue-900/60">Nationalité</dt><dd>{d.nationalite}</dd></div>
                  <div><dt className="text-toac-blue-900/60">Date de naissance</dt><dd>{d.date_naissance}</dd></div>
                  <div className="sm:col-span-2">
                    <dt className="text-toac-blue-900/60">Adresse</dt>
                    <dd>{d.adresse}, {d.code_postal} {d.ville}</dd>
                  </div>
                  {d.est_mineur && (
                    <div className="sm:col-span-2">
                      <dt className="text-toac-blue-900/60">Autorisation parentale</dt>
                      <dd>{d.representant_nom} — signée le {d.date_signature_representant}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={documentHref(d.decharge_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-toac-blue-800 px-3 py-1.5 text-xs font-medium text-toac-blue-950 hover:bg-toac-blue-950 hover:text-white"
                  >
                    Voir/télécharger la décharge →
                  </a>
                  <a
                    href={documentHref(d.certificat_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-toac-blue-800 px-3 py-1.5 text-xs font-medium text-toac-blue-950 hover:bg-toac-blue-950 hover:text-white"
                  >
                    Voir/télécharger le certificat →
                  </a>
                  <button
                    type="button"
                    onClick={() => copyReviewLink(d)}
                    className="rounded-md border border-toac-gray-200 px-3 py-1.5 text-xs font-medium text-toac-blue-900 hover:bg-toac-gray-100"
                  >
                    {copiedId === d.id ? "Lien copié ✓" : "Copier le lien de partage/relecture"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d)}
                    disabled={deletingId === d.id}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {deletingId === d.id ? "Suppression…" : "Supprimer le dossier"}
                  </button>
                </div>
                {deleteError && deletingId === null && (
                  <p role="alert" className="mt-3 text-xs font-medium text-red-600">
                    {deleteError}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-lg border border-toac-gray-200 bg-white p-6 text-center text-toac-blue-900/60 shadow-sm">
            {!showPending && pendingCount > 0
              ? "Aucune décharge validée pour le moment — cochez la case ci-dessus pour voir les dossiers en attente."
              : "Aucune décharge musculation pour le moment."}
          </p>
        )}
      </div>
    </div>
  );
}
