"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Bouton de validation du dossier « salle de musculation ». En cas de succès,
 * la page est rejouée côté serveur : c'est elle qui affiche alors l'écran de
 * confirmation, à partir du statut réellement enregistré en base.
 */
export default function ValiderMusculationDecharge({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleConfirm() {
    setStatus("sending");
    setErrorMessage(null);

    let response: Response;
    try {
      response = await fetch("/api/musculation/decharge/valider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {
      setErrorMessage("Erreur réseau. Réessayez plus tard.");
      setStatus("error");
      return;
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setErrorMessage(data?.error ?? "Une erreur est survenue. Réessayez plus tard.");
      setStatus("error");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={status === "sending"}
        className="rounded-md bg-toac-pink-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400 disabled:opacity-60"
      >
        {status === "sending" ? "Validation…" : "Valider ce document"}
      </button>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
