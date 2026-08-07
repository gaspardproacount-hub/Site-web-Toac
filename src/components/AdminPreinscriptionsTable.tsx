"use client";

import { useMemo, useState } from "react";
import type { PreinscriptionRow } from "@/lib/db";

const STATUT_LABELS: Record<string, string> = {
  exterieur: "Extérieur (dont Airbus Central)",
  airbus: "Airbus Opérations & Ayant droit Airbus Opérations",
  chomeur_etudiant: "Chômeurs & Étudiants",
};

const INTERESSE_LABELS: Record<string, string> = {
  interesse: "Intéressé(e)",
  pas_interesse: "Pas intéressé(e)",
};

const STAGE_LABELS: Record<string, string> = {
  participe: "Participe",
  non: "N'y participera pas",
  ne_sait_pas: "Ne sait pas encore",
};

const BENEVOLAT_LABELS: Record<string, string> = {
  oui: "Oui",
  indisponible: "Indisponible à cette date, aide en amont",
};

const TRIFONCTION_LABELS: Record<string, string> = {
  nouvelle: "Achète une nouvelle trifonction",
  conserve: "Conserve sa trifonction",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function formatList(values: string[], labels: Record<string, string>): string {
  if (!values.length) return "—";
  return values.map((v) => labels[v] ?? v).join(", ");
}

export default function AdminPreinscriptionsTable({
  preinscriptions,
}: {
  preinscriptions: PreinscriptionRow[];
}) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return preinscriptions;
    return preinscriptions.filter((p) =>
      `${p.prenom} ${p.nom} ${p.email}`.toLowerCase().includes(query)
    );
  }, [preinscriptions, search]);

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{preinscriptions.length}</div>
          <div className="text-xs text-toac-blue-900/60">pré-inscriptions reçues</div>
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
        {filtered.map((p) => (
          <div key={p.id} className="rounded-lg border border-toac-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div>
                <div className="font-medium text-toac-blue-950">
                  {p.prenom} {p.nom} <span className="font-normal text-toac-blue-900/60">— {p.email}</span>
                </div>
                <div className="text-xs text-toac-blue-900/60">
                  Reçue le {formatDate(p.recue_le)} · {STATUT_LABELS[p.statut] ?? p.statut}
                </div>
              </div>
              <span aria-hidden="true" className="text-toac-blue-900/50">
                {expanded === p.id ? "▲" : "▼"}
              </span>
            </button>
            {expanded === p.id && (
              <dl className="grid gap-x-6 gap-y-2 border-t border-toac-gray-100 px-4 py-4 text-sm sm:grid-cols-2">
                <div><dt className="text-toac-blue-900/60">Date de naissance</dt><dd>{p.date_naissance || "—"}</dd></div>
                <div><dt className="text-toac-blue-900/60">Téléphone</dt><dd>{p.telephone || "—"}</dd></div>
                <div>
                  <dt className="text-toac-blue-900/60">Permis de conduire</dt>
                  <dd>{p.permis_conduire ? `Oui — ${p.numero_permis || "numéro non précisé"}` : "Non"}</dd>
                </div>
                <div><dt className="text-toac-blue-900/60">Statut / tarif</dt><dd>{STATUT_LABELS[p.statut] ?? p.statut}</dd></div>
                <div className="sm:col-span-2">
                  <dt className="text-toac-blue-900/60">Bénévolat Triathlons du Lauragais</dt>
                  <dd>{formatList(p.benevolat, BENEVOLAT_LABELS)}</dd>
                </div>
                <div><dt className="text-toac-blue-900/60">Règlement intérieur accepté</dt><dd>{p.reglement_accepte ? "Oui" : "Non"}</dd></div>
                <div>
                  <dt className="text-toac-blue-900/60">Trifonction</dt>
                  <dd>{formatList(p.trifonction, TRIFONCTION_LABELS)}</dd>
                </div>
                <div><dt className="text-toac-blue-900/60">Brevets fédéraux</dt><dd>{INTERESSE_LABELS[p.brevets_federaux ?? ""] ?? p.brevets_federaux ?? "—"}</dd></div>
                <div><dt className="text-toac-blue-900/60">Arbitrage</dt><dd>{INTERESSE_LABELS[p.arbitrage ?? ""] ?? p.arbitrage ?? "—"}</dd></div>
                <div className="sm:col-span-2">
                  <dt className="text-toac-blue-900/60">Soutien / partenaire</dt>
                  <dd>{INTERESSE_LABELS[p.soutien_partenaire ?? ""] ?? p.soutien_partenaire ?? "—"}</dd>
                </div>
                <div><dt className="text-toac-blue-900/60">Stage Argelès</dt><dd>{STAGE_LABELS[p.stage_argeles ?? ""] ?? p.stage_argeles ?? "—"}</dd></div>
                <div><dt className="text-toac-blue-900/60">Stage Montagne</dt><dd>{STAGE_LABELS[p.stage_montagne ?? ""] ?? p.stage_montagne ?? "—"}</dd></div>
                {p.questions_suggestions && (
                  <div className="sm:col-span-2">
                    <dt className="text-toac-blue-900/60">Questions / suggestions</dt>
                    <dd>{p.questions_suggestions}</dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-lg border border-toac-gray-200 bg-white p-6 text-center text-toac-blue-900/60 shadow-sm">
            Aucune pré-inscription pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
