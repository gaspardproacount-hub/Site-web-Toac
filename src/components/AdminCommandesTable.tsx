"use client";

import { useMemo, useState } from "react";
import type { CommandeRow } from "@/lib/db";

function formatMontant(centimes: number | null, devise: string | null): string {
  if (centimes == null) return "—";
  return `${(centimes / 100).toFixed(2)} ${devise ?? "EUR"}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminCommandesTable({ commandes }: { commandes: CommandeRow[] }) {
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return commandes.filter((c) => {
      const matchesQuery =
        !query ||
        `${c.reference} ${c.email ?? ""}`.toLowerCase().includes(query);
      const matchesStatut = statutFilter === "all" || c.statut === statutFilter;
      return matchesQuery && matchesStatut;
    });
  }, [commandes, search, statutFilter]);

  const totalPaye = useMemo(
    () =>
      commandes
        .filter((c) => c.statut === "payé")
        .reduce((sum, c) => sum + (c.montant_centimes ?? 0), 0),
    [commandes]
  );

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{commandes.length}</div>
          <div className="text-xs text-toac-blue-900/60">commandes reçues</div>
        </div>
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{(totalPaye / 100).toFixed(2)} €</div>
          <div className="text-xs text-toac-blue-900/60">total encaissé</div>
        </div>
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{filtered.length}</div>
          <div className="text-xs text-toac-blue-900/60">résultats affichés</div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une référence ou un email…"
          className="flex-1 rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
        />
        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
          className="rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
        >
          <option value="all">Tous les statuts</option>
          <option value="payé">payé</option>
          <option value="refusé">refusé</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-toac-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-toac-gray-200 text-sm">
          <thead className="bg-toac-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Reçue le</th>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Référence</th>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Email</th>
              <th className="px-3 py-2 text-right font-medium text-toac-blue-950">Montant</th>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Statut</th>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Carte</th>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Code retour</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toac-gray-100">
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(c.recu_le)}</td>
                <td className="px-3 py-2 font-medium text-toac-blue-950">{c.reference}</td>
                <td className="px-3 py-2">{c.email ?? "—"}</td>
                <td className="px-3 py-2 text-right">{formatMontant(c.montant_centimes, c.devise)}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      c.statut === "payé"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                        : "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                    }
                  >
                    {c.statut}
                  </span>
                </td>
                <td className="px-3 py-2">{c.marque_carte ?? "—"}</td>
                <td className="px-3 py-2">{c.code_retour ?? "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-toac-blue-900/60">
                  Aucune commande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
