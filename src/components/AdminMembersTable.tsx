"use client";

import { useMemo, useState } from "react";
import type { Member } from "@/lib/types";
import { DOSSIER_LABELS, dossierCompletion } from "./DossierChecklist";

export default function AdminMembersTable({ members }: { members: Member[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((m) => {
      const matchesQuery =
        !query ||
        `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [members, search, statusFilter]);

  const globalCompletion = useMemo(() => {
    if (members.length === 0) return 0;
    const total = members.reduce((sum, m) => sum + dossierCompletion(m.dossier), 0);
    return Math.round(total / members.length);
  }, [members]);

  const dossierKeys = Object.keys(DOSSIER_LABELS) as Array<keyof typeof DOSSIER_LABELS>;

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{members.length}</div>
          <div className="text-xs text-toac-blue-900/60">adhérents</div>
        </div>
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{globalCompletion}%</div>
          <div className="text-xs text-toac-blue-900/60">complétion moyenne</div>
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
          placeholder="Rechercher un adhérent…"
          className="flex-1 rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
        >
          <option value="all">Tous les statuts</option>
          <option value="new">new</option>
          <option value="membre">membre</option>
          <option value="bureau">bureau</option>
          <option value="arbitre">arbitre</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-toac-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-toac-gray-200 text-sm">
          <thead className="bg-toac-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Adhérent</th>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Statut</th>
              {dossierKeys.map((key) => (
                <th key={key} className="px-3 py-2 text-center font-medium text-toac-blue-950">
                  {DOSSIER_LABELS[key]}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-medium text-toac-blue-950">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toac-gray-100">
            {filtered.map((m) => (
              <tr key={m.id}>
                <td className="px-3 py-2">
                  <div className="font-medium text-toac-blue-950">
                    {m.firstName} {m.lastName}
                  </div>
                  <div className="text-xs text-toac-blue-900/60">{m.email}</div>
                </td>
                <td className="px-3 py-2">{m.status}</td>
                {dossierKeys.map((key) => (
                  <td key={key} className="px-3 py-2 text-center">
                    {m.dossier[key] ? "✅" : "—"}
                  </td>
                ))}
                <td className="px-3 py-2 text-center font-medium">{dossierCompletion(m.dossier)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
