"use client";

import { useState, type FormEvent } from "react";

const inputClass =
  "w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30";
const labelClass = "mb-1 block text-sm font-medium text-toac-blue-900";
const fileInputClass =
  "w-full text-sm text-toac-blue-900 file:mr-3 file:rounded-md file:border-0 file:bg-toac-blue-950 file:px-4 file:py-2 file:text-sm file:text-white";

/**
 * Formulaire "décharge salle de musculation" : reprend les champs de la
 * décharge papier du TOAC Omnisports, génère le document équivalent
 * côté serveur et le dépose (avec le certificat médical) dans le dossier
 * Google Drive du club — voir /api/musculation/decharge.
 */
export default function MusculationDechargeForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [estMineur, setEstMineur] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);

    let response: Response;
    try {
      response = await fetch("/api/musculation/decharge", {
        method: "POST",
        body: formData,
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
    setStatus("sent");
    event.currentTarget.reset();
    setEstMineur(false);
  }

  if (status === "sent") {
    return (
      <p className="rounded-md border border-green-300 bg-green-50 p-4 text-green-800">
        Merci, votre décharge et votre certificat médical ont bien été transmis au bureau du club.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nom" className={labelClass}>Nom</label>
          <input id="nom" name="nom" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="prenom" className={labelClass}>Prénom</label>
          <input id="prenom" name="prenom" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="nationalite" className={labelClass}>Nationalité</label>
          <input id="nationalite" name="nationalite" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="dateNaissance" className={labelClass}>Date de naissance</label>
          <input id="dateNaissance" name="dateNaissance" type="date" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="adresse" className={labelClass}>Adresse</label>
        <input id="adresse" name="adresse" required className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="codePostal" className={labelClass}>Code postal</label>
          <input id="codePostal" name="codePostal" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="ville" className={labelClass}>Ville</label>
          <input id="ville" name="ville" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="dateSignature" className={labelClass}>Date (Toulouse, le…)</label>
        <input id="dateSignature" name="dateSignature" type="date" required className={inputClass} />
      </div>

      <label className="flex items-start gap-2 text-sm text-toac-blue-900">
        <input
          type="checkbox"
          name="estMineur"
          className="mt-1"
          checked={estMineur}
          onChange={(e) => setEstMineur(e.target.checked)}
        />
        Je suis mineur(e) (15 à 18 ans) — autorisation parentale requise
      </label>

      {estMineur && (
        <div className="grid gap-4 rounded-md border border-toac-gray-200 bg-toac-gray-50 p-4 sm:grid-cols-2">
          <div>
            <label htmlFor="representantNom" className={labelClass}>
              Nom du père / mère / répondant légal
            </label>
            <input
              id="representantNom"
              name="representantNom"
              required={estMineur}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="dateSignatureRepresentant" className={labelClass}>
              Date de signature du représentant légal
            </label>
            <input
              id="dateSignatureRepresentant"
              name="dateSignatureRepresentant"
              type="date"
              required={estMineur}
              className={inputClass}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="certificatMedical" className={labelClass}>
          Certificat médical d&apos;aptitude à la musculation (sans contre-indication, valable 3 ans)
        </label>
        <input
          id="certificatMedical"
          name="certificatMedical"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          required
          className={fileInputClass}
        />
        <p className="mt-1 text-xs text-toac-blue-900/60">Image (JPG, PNG) ou PDF, 10 Mo maximum.</p>
      </div>

      <div>
        <label htmlFor="signature" className={labelClass}>
          Votre signature (photo ou scan)
        </label>
        <input
          id="signature"
          name="signature"
          type="file"
          accept=".jpg,.jpeg,.png"
          required
          className={fileInputClass}
        />
        <p className="mt-1 text-xs text-toac-blue-900/60">
          Signez sur une feuille blanche puis prenez-la en photo, ou utilisez une image de votre signature (JPG, PNG).
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm text-toac-blue-900/90">
        <input type="checkbox" name="rgpdConsent" required className="mt-1" />
        J&apos;accepte que les données et documents transmis dans ce formulaire (dont mon certificat
        médical et ma signature) soient traités et conservés par le TOAC Triathlon dans le seul but de
        gérer l&apos;accès à la salle de musculation, conformément au RGPD.
      </label>

      {errorMessage && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-toac-pink-500 px-6 py-2.5 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400 disabled:opacity-60"
      >
        {status === "sending" ? "Envoi…" : "Envoyer ma décharge"}
      </button>
    </form>
  );
}
