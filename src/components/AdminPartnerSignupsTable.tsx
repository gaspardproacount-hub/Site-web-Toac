"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PartnerSignupRow } from "@/lib/db";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

const PARTNER_LABELS: Record<string, string> = {
  alltricks: "Alltricks",
};

function partnerLabel(slug: string): string {
  return PARTNER_LABELS[slug] ?? slug;
}

const STATUT_LABELS: Record<string, string> = {
  a_traiter: "À traiter",
  ajoute: "Ajouté",
};

const STATUT_CLASSES: Record<string, string> = {
  a_traiter: "bg-amber-100 text-amber-800",
  ajoute: "bg-green-100 text-green-800",
};

/**
 * État de la notification envoyée au responsable partenariat : sans cette
 * information, un envoi refusé par le service d'emails resterait invisible.
 */
function NotificationEtat({ signup: s }: { signup: PartnerSignupRow }) {
  const destinataires = s.notification_destinataires ?? [];

  if (s.notification_statut === "envoyee") {
    return (
      <>
        <span className="font-medium text-emerald-700">✓ Notification envoyée</span>
        <span className="text-toac-blue-900/60"> le {formatDate(s.notification_le)}</span>
        {destinataires.length > 0 && (
          <div className="mt-1 text-toac-blue-900/70">À : {destinataires.join(", ")}</div>
        )}
      </>
    );
  }

  if (s.notification_statut === "echec" || s.notification_statut === "ignoree") {
    return (
      <>
        <span className="font-medium text-red-700">
          {s.notification_statut === "echec" ? "✕ Envoi en échec" : "✕ Aucun email envoyé"}
        </span>
        <span className="text-toac-blue-900/60"> le {formatDate(s.notification_le)}</span>
        {s.notification_erreur && (
          <div className="mt-1 break-words text-toac-blue-900/70">{s.notification_erreur}</div>
        )}
      </>
    );
  }

  return <span className="text-toac-blue-900/60">Notification non envoyée.</span>;
}

async function postAction(url: string, id: number): Promise<{ ok: boolean; error?: string }> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  } catch {
    return { ok: false, error: "Erreur réseau. Réessayez plus tard." };
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, error: data?.error ?? "Une erreur est survenue." };
  }
  return { ok: true };
}

export default function AdminPartnerSignupsTable({ signups }: { signups: PartnerSignupRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ id: number; text: string; ok: boolean } | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return signups;
    return signups.filter((s) =>
      `${s.prenom} ${s.nom} ${s.email} ${partnerLabel(s.partenaire)}`.toLowerCase().includes(query)
    );
  }, [signups, search]);

  async function handleConfirmer(s: PartnerSignupRow) {
    setBusyId(s.id);
    setMessage(null);
    const result = await postAction("/api/admin/partner-signups/confirmer", s.id);
    setBusyId(null);
    setMessage({
      id: s.id,
      ok: result.ok,
      text: result.ok ? "Confirmé — l'adhérent a été notifié par email." : (result.error ?? "Échec."),
    });
    if (result.ok) router.refresh();
  }

  async function handleNotifier(s: PartnerSignupRow) {
    setBusyId(s.id);
    setMessage(null);
    const result = await postAction("/api/admin/partner-signups/notifier", s.id);
    setBusyId(null);
    setMessage({ id: s.id, ok: result.ok, text: result.ok ? "Notification envoyée." : (result.error ?? "Échec.") });
    if (result.ok) router.refresh();
  }

  async function handleSupprimer(s: PartnerSignupRow) {
    const confirmed = window.confirm(
      `Supprimer définitivement la demande de ${s.prenom} ${s.nom} ? Cette action est irréversible.`
    );
    if (!confirmed) return;

    setBusyId(s.id);
    setMessage(null);
    const result = await postAction("/api/admin/partner-signups/supprimer", s.id);
    setBusyId(null);
    if (!result.ok) {
      setMessage({ id: s.id, ok: false, text: result.error ?? "La suppression a échoué." });
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">{signups.length}</div>
          <div className="text-xs text-toac-blue-900/60">demandes reçues</div>
        </div>
        <div className="rounded-lg border border-toac-gray-200 bg-white p-4 shadow-sm">
          <div className="font-display text-2xl text-toac-blue-950">
            {signups.filter((s) => s.statut === "a_traiter").length}
          </div>
          <div className="text-xs text-toac-blue-900/60">à traiter</div>
        </div>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Rechercher un nom, un email ou un partenaire…"
        className="mb-4 w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
      />

      <div className="space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-lg border border-toac-gray-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
            >
              <div>
                <div className="font-medium text-toac-blue-950">
                  {s.prenom} {s.nom} <span className="font-normal text-toac-blue-900/60">— {s.email}</span>
                </div>
                <div className="mt-1 text-xs text-toac-blue-900/60">
                  {partnerLabel(s.partenaire)} · Reçue le {formatDate(s.recue_le)}
                  {s.statut === "ajoute" && ` · Ajoutée le ${formatDate(s.ajoute_le)}`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUT_CLASSES[s.statut] ?? "bg-toac-gray-100 text-toac-blue-900"}`}
                >
                  {STATUT_LABELS[s.statut] ?? s.statut}
                </span>
                <span aria-hidden="true" className="text-toac-blue-900/50">
                  {expanded === s.id ? "▲" : "▼"}
                </span>
              </div>
            </button>
            {expanded === s.id && (
              <div className="border-t border-toac-gray-100 px-4 py-4 text-sm">
                <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  <div><dt className="text-toac-blue-900/60">Partenaire</dt><dd>{partnerLabel(s.partenaire)}</dd></div>
                  <div><dt className="text-toac-blue-900/60">Consentement</dt><dd>{s.consentement ? "Donné" : "—"}</dd></div>
                </dl>

                <div className="mt-4 rounded-md border border-toac-gray-200 bg-toac-gray-50 px-3 py-2 text-xs">
                  <NotificationEtat signup={s} />
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {s.statut !== "ajoute" && (
                    <button
                      type="button"
                      onClick={() => handleConfirmer(s)}
                      disabled={busyId === s.id}
                      className="rounded-md bg-toac-pink-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-toac-pink-400 disabled:opacity-60"
                    >
                      {busyId === s.id ? "…" : `Confirmer l'ajout sur ${partnerLabel(s.partenaire)}`}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleNotifier(s)}
                    disabled={busyId === s.id}
                    className="rounded-md border border-toac-gray-200 px-3 py-1.5 text-xs font-medium text-toac-blue-900 hover:bg-toac-gray-100 disabled:opacity-60"
                  >
                    {busyId === s.id ? "…" : "Renvoyer la notification"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSupprimer(s)}
                    disabled={busyId === s.id}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                  >
                    {busyId === s.id ? "…" : "Supprimer la demande"}
                  </button>
                </div>
                {message?.id === s.id && (
                  <p
                    role="status"
                    className={`mt-3 text-xs font-medium ${message.ok ? "text-emerald-700" : "text-red-600"}`}
                  >
                    {message.text}
                  </p>
                )}
              </div>
            )}
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
