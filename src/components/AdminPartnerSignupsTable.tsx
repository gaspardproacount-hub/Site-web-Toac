"use client";

import { useMemo, useState } from "react";
import type { PartnerSignupRow } from "@/lib/db";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

async function patchSignup(id: number, statut: string) {
  const response = await fetch(`/api/admin/partner-signups/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ statut }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Échec de la mise à jour.");
  }
}

export default function AdminPartnerSignupsTable({ signups }: { signups: PartnerSignupRow[] }) {
  const [data, setData] = useState(signups);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data;
    return data.filter((s) => `${s.prenom} ${s.nom} ${s.email} ${s.partenaire}`.toLowerCase().includes(query));
  }, [data, search]);

  async function toggleStatut(signup: PartnerSignupRow) {
    const nextStatut = signup.statut === "traite" ? "nouveau" : "traite";
    const previous = signup.statut;
    setError(null);
    setData((prev) => prev.map((s) => (s.id === signup.id ? { ...s, statut: nextStatut } : s)));
    try {
      await patchSignup(signup.id, nextStatut);
    } catch (err) {
      setData((prev) => prev.map((s) => (s.id === signup.id ? { ...s, statut: previous } : s)));
      setError(err instanceof Error ? err.message : "Échec de la mise à jour.");
    }
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{data.length}</div>
          <div className="text-xs text-toac-blue-900/60">demandes reçues</div>
        </div>
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">
            {data.filter((s) => s.statut !== "traite").length}
          </div>
          <div className="text-xs text-toac-blue-900/60">à traiter</div>
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un nom, un email ou un partenaire…"
        className="mb-4 w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
      />

      <div className="space-y-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-toac-gray-200 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <div className="font-medium text-toac-blue-950">
                {s.prenom} {s.nom} <span className="font-normal text-toac-blue-900/60">— {s.email}</span>
              </div>
              <div className="text-xs text-toac-blue-900/60">
                {s.partenaire} · Reçue le {formatDate(s.recue_le)}
              </div>
            </div>
            <label className="flex shrink-0 items-center gap-2 text-sm text-toac-blue-900">
              <input
                type="checkbox"
                checked={s.statut === "traite"}
                onChange={() => toggleStatut(s)}
              />
              Traité
            </label>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-lg border border-toac-gray-200 bg-white p-6 text-center text-toac-blue-900/60 shadow-sm">
            Aucune demande pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
