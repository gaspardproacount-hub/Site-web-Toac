"use client";

import { useMemo, useState } from "react";
import type { InscriptionRow } from "@/lib/db";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminInscriptionsTable({ inscriptions }: { inscriptions: InscriptionRow[] }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return inscriptions;
    return inscriptions.filter((i) =>
      `${i.prenom} ${i.nom} ${i.email}`.toLowerCase().includes(query)
    );
  }, [inscriptions, search]);

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{inscriptions.length}</div>
          <div className="text-xs text-toac-blue-900/60">demandes d&apos;adhésion reçues</div>
        </div>
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{filtered.length}</div>
          <div className="text-xs text-toac-blue-900/60">résultats affichés</div>
        </div>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un nom ou un email…"
        className="mb-4 w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
      />

      <div className="space-y-3">
        {filtered.map((i) => (
          <div key={i.id} className="rounded-lg border border-toac-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i.id ? null : i.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div>
                <div className="font-medium text-toac-blue-950">
                  {i.prenom} {i.nom} <span className="font-normal text-toac-blue-900/60">— {i.email}</span>
                </div>
                <div className="text-xs text-toac-blue-900/60">
                  Reçue le {formatDate(i.recue_le)} · {i.formule || "formule non précisée"}
                </div>
              </div>
              <span aria-hidden="true" className="text-toac-blue-900/50">
                {expanded === i.id ? "▲" : "▼"}
              </span>
            </button>
            {expanded === i.id && (
              <dl className="grid gap-x-6 gap-y-2 border-t border-toac-gray-100 px-4 py-4 text-sm sm:grid-cols-2">
                <div><dt className="text-toac-blue-900/60">Date de naissance</dt><dd>{i.date_naissance || "—"}</dd></div>
                <div><dt className="text-toac-blue-900/60">Téléphone</dt><dd>{i.telephone || "—"}</dd></div>
                <div className="sm:col-span-2"><dt className="text-toac-blue-900/60">Adresse</dt><dd>{i.adresse || "—"}</dd></div>
                <div><dt className="text-toac-blue-900/60">Licence FFTRI existante</dt><dd>{i.licence_existante || "—"}</dd></div>
                <div><dt className="text-toac-blue-900/60">Certificat médical / PPS</dt><dd>{i.certificat_medical || "—"}</dd></div>
                <div><dt className="text-toac-blue-900/60">Contact d&apos;urgence</dt><dd>{i.contact_urgence_nom || "—"} {i.contact_urgence_telephone ? `(${i.contact_urgence_telephone})` : ""}</dd></div>
                <div><dt className="text-toac-blue-900/60">Droit à l&apos;image</dt><dd>{i.droit_image ? "Oui" : "Non"}</dd></div>
                {i.message && (
                  <div className="sm:col-span-2"><dt className="text-toac-blue-900/60">Message</dt><dd>{i.message}</dd></div>
                )}
              </dl>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-lg border border-toac-gray-200 bg-white p-6 text-center text-toac-blue-900/60 shadow-sm">
            Aucune demande d&apos;adhésion pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
