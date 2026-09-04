"use client";

import { useState } from "react";

export default function ValiderMusculationDecharge({
  token,
  dejaValidee,
}: {
  token: string;
  dejaValidee: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "valide" | "error">(
    dejaValidee ? "valide" : "idle"
  );
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
    setStatus("valide");
  }

  if (status === "valide") {
    return (
      <p className="rounded-md border border-green-300 bg-green-50 p-4 text-green-800">
        Merci, votre décharge est validée et transmise au bureau du club.
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={status === "sending"}
        className="rounded-md bg-toac-pink-500 px-6 py-2.5 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400 disabled:opacity-60"
      >
        {status === "sending" ? "Validation…" : "Confirmer et transmettre au club"}
      </button>
      {errorMessage && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
