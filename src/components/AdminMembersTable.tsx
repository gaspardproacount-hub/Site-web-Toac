"use client";

import { useMemo, useState } from "react";
import type { Member, MemberStatus } from "@/lib/types";
import { DOSSIER_COLUMNS, isColumnChecked, dossierCompletion, type DossierColumn } from "./DossierChecklist";

const STATUSES: MemberStatus[] = ["new", "membre", "bureau", "arbitre"];

async function patchMember(id: string, patch: Record<string, boolean | string>) {
  const response = await fetch(`/api/admin/members/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Échec de la mise à jour.");
  }
}

export default function AdminMembersTable({ members }: { members: Member[] }) {
  const [data, setData] = useState(members);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.filter((m) => {
      const matchesQuery =
        !query ||
        `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || m.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const globalCompletion = useMemo(() => {
    if (data.length === 0) return 0;
    const total = data.reduce((sum, m) => sum + dossierCompletion(m.dossier), 0);
    return Math.round(total / data.length);
  }, [data]);

  async function toggleColumn(member: Member, column: DossierColumn) {
    const nextValue = !isColumnChecked(member.dossier, column);
    const previousDossier = member.dossier;
    setError(null);
    setData((prev) =>
      prev.map((m) =>
        m.id === member.id
          ? {
              ...m,
              dossier: column.fields.reduce(
                (d, field) => ({ ...d, [field]: nextValue }),
                m.dossier
              ),
            }
          : m
      )
    );
    try {
      await patchMember(
        member.id,
        Object.fromEntries(column.fields.map((field) => [field, nextValue]))
      );
    } catch (err) {
      setData((prev) => prev.map((m) => (m.id === member.id ? { ...m, dossier: previousDossier } : m)));
      setError(err instanceof Error ? err.message : "Échec de la mise à jour.");
    }
  }

  async function changeStatus(member: Member, nextStatus: MemberStatus) {
    const previousStatus = member.status;
    setError(null);
    setData((prev) => prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m)));
    try {
      await patchMember(member.id, { status: nextStatus });
    } catch (err) {
      setData((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: previousStatus } : m))
      );
      setError(err instanceof Error ? err.message : "Échec de la mise à jour.");
    }
  }

  async function removeMember(member: Member) {
    const confirmed = window.confirm(
      `Supprimer définitivement le dossier de ${member.firstName} ${member.lastName} ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    setError(null);
    setDeletingId(member.id);
    const previous = data;
    setData((prev) => prev.filter((m) => m.id !== member.id));

    try {
      const response = await fetch(`/api/admin/members/${member.id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Échec de la suppression.");
      }
    } catch (err) {
      setData(previous);
      setError(err instanceof Error ? err.message : "Échec de la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{data.length}</div>
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
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-toac-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-toac-gray-200 text-sm">
          <thead className="bg-toac-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Adhérent</th>
              <th className="px-3 py-2 text-left font-medium text-toac-blue-950">Statut</th>
              {DOSSIER_COLUMNS.map((column) => (
                <th key={column.key} className="px-3 py-2 text-center font-medium text-toac-blue-950">
                  {column.label}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-medium text-toac-blue-950">%</th>
              <th className="px-3 py-2 text-center font-medium text-toac-blue-950">
                <span className="sr-only">Supprimer</span>
              </th>
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
                <td className="px-3 py-2">
                  <select
                    value={m.status}
                    onChange={(e) => changeStatus(m, e.target.value as MemberStatus)}
                    className="rounded-md border border-toac-gray-200 px-2 py-1 text-xs outline-none focus:border-toac-blue-600"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                {DOSSIER_COLUMNS.map((column) => {
                  const checked = isColumnChecked(m.dossier, column);
                  return (
                    <td key={column.key} className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => toggleColumn(m, column)}
                        aria-pressed={checked}
                        title="Cliquez pour cocher/décocher"
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                          checked
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-toac-gray-100 text-toac-blue-900/50 hover:bg-toac-gray-200"
                        }`}
                      >
                        {checked ? "✅" : "—"}
                      </button>
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center font-medium">{dossierCompletion(m.dossier)}%</td>
                <td className="px-3 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeMember(m)}
                    disabled={deletingId === m.id}
                    title="Supprimer ce dossier"
                    aria-label={`Supprimer le dossier de ${m.firstName} ${m.lastName}`}
                    className="rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === m.id ? "…" : "Supprimer"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={DOSSIER_COLUMNS.length + 4} className="px-3 py-6 text-center text-toac-blue-900/60">
                  Aucun adhérent pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
