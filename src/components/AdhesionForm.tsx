"use client";

import { useState, type FormEvent } from "react";
import { TARIFS } from "@/content/tarifs";

const inputClass =
  "w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30";
const labelClass = "mb-1 block text-sm font-medium text-toac-blue-900";

export default function AdhesionForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      prenom: form.get("prenom"),
      nom: form.get("nom"),
      dateNaissance: form.get("dateNaissance"),
      email: form.get("email"),
      telephone: form.get("telephone"),
      adresse: form.get("adresse"),
      formule: form.get("formule"),
      licenceExistante: form.get("licenceExistante"),
      contactUrgenceNom: form.get("contactUrgenceNom"),
      contactUrgenceTelephone: form.get("contactUrgenceTelephone"),
      certificatMedical: form.get("certificatMedical"),
      droitImage: form.get("droitImage") === "on",
      message: form.get("message"),
    };

    try {
      const response = await fetch("/api/adhesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error ?? "Une erreur est survenue.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setErrorMessage("Erreur réseau. Réessayez plus tard.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-md border border-green-300 bg-green-50 p-4 text-green-800">
        Merci ! Votre demande d&apos;adhésion a bien été transmise au bureau. Vous pouvez maintenant passer à
        l&apos;étape de paiement en ligne ci-dessous.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="prenom" className={labelClass}>Prénom</label>
          <input id="prenom" name="prenom" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="nom" className={labelClass}>Nom</label>
          <input id="nom" name="nom" required className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dateNaissance" className={labelClass}>Date de naissance</label>
          <input id="dateNaissance" name="dateNaissance" type="date" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="telephone" className={labelClass}>Téléphone</label>
          <input id="telephone" name="telephone" type="tel" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="adresse" className={labelClass}>Adresse postale</label>
          <input id="adresse" name="adresse" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="formule" className={labelClass}>Formule souhaitée</label>
        <select id="formule" name="formule" required className={inputClass}>
          {TARIFS.map((t) => (
            <option key={t.id} value={t.label}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="licenceExistante" className={labelClass}>
          Numéro de licence FFTRI (si renouvellement — laissez vide sinon)
        </label>
        <input id="licenceExistante" name="licenceExistante" className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contactUrgenceNom" className={labelClass}>Contact d&apos;urgence — nom</label>
          <input id="contactUrgenceNom" name="contactUrgenceNom" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="contactUrgenceTelephone" className={labelClass}>
            Contact d&apos;urgence — téléphone
          </label>
          <input
            id="contactUrgenceTelephone"
            name="contactUrgenceTelephone"
            type="tel"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="certificatMedical" className={labelClass}>
          Certificat médical / attestation de santé (PPS)
        </label>
        <select id="certificatMedical" name="certificatMedical" required className={inputClass}>
          <option value="Certificat médical fourni">Certificat médical fourni</option>
          <option value="Attestation PPS (questionnaire de santé) fournie">
            Attestation PPS (questionnaire de santé) fournie
          </option>
          <option value="À fournir prochainement">À fournir prochainement</option>
        </select>
      </div>

      <label className="flex items-start gap-2 text-sm text-toac-blue-900/90">
        <input type="checkbox" name="droitImage" className="mt-1" />
        J&apos;autorise le TOAC Triathlon à utiliser mon image sur ses supports de communication
        (site, réseaux sociaux).
      </label>

      <div>
        <label htmlFor="message" className={labelClass}>Message (optionnel)</label>
        <textarea id="message" name="message" rows={3} className={inputClass} />
      </div>

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
        {status === "sending" ? "Envoi…" : "Envoyer ma demande d'adhésion"}
      </button>
    </form>
  );
}
