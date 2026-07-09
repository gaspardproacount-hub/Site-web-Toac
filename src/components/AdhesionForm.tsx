"use client";

import { useState } from "react";
import { ADHESION_TARIFS, ASSURANCE_TARIFS, CAUTION_CENTIMES, type LicenceType } from "@/content/tarifs";

const inputClass =
  "w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30";
const labelClass = "mb-1 block text-sm font-medium text-toac-blue-900";

function euros(centimes: number): string {
  return `${(centimes / 100).toFixed(2).replace(".", ",")} €`;
}

/**
 * Formulaire d'adhésion unique : informations + choix du tarif + paiement en
 * une seule étape. La soumission est une navigation classique (pas de fetch) :
 * /api/adhesion enregistre l'inscription puis renvoie la page qui redirige
 * automatiquement vers le paiement sécurisé Monetico (cotisation + caution).
 */
export default function AdhesionForm() {
  const [tarifReduit, setTarifReduit] = useState<"non" | "oui">("non");
  const [licenceType, setLicenceType] = useState<LicenceType>("loisir");
  const [assuranceId, setAssuranceId] = useState(ASSURANCE_TARIFS[1].id);
  const [sending, setSending] = useState(false);

  const tarif = ADHESION_TARIFS[tarifReduit === "oui" ? "reduit" : "plein"][licenceType];
  const assurance = ASSURANCE_TARIFS.find((a) => a.id === assuranceId) ?? ASSURANCE_TARIFS[1];
  const total = tarif.montantCentimes + assurance.montantCentimes + CAUTION_CENTIMES;

  return (
    <form
      action="/api/adhesion"
      method="POST"
      encType="multipart/form-data"
      onSubmit={() => setSending(true)}
      className="space-y-4"
    >
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

      <fieldset className="rounded-md border border-toac-gray-200 p-4">
        <legend className="px-1 text-sm font-medium text-toac-blue-900">Licence FFTRI souhaitée</legend>
        <div className="mt-1 flex gap-6">
          <label className="flex items-center gap-2 text-sm text-toac-blue-900">
            <input
              type="radio"
              name="licenceType"
              value="loisir"
              checked={licenceType === "loisir"}
              onChange={() => setLicenceType("loisir")}
            />
            Loisir
          </label>
          <label className="flex items-center gap-2 text-sm text-toac-blue-900">
            <input
              type="radio"
              name="licenceType"
              value="competition"
              checked={licenceType === "competition"}
              onChange={() => setLicenceType("competition")}
            />
            Compétition
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-md border border-toac-gray-200 p-4">
        <legend className="px-1 text-sm font-medium text-toac-blue-900">
          Appartenez-vous à l&apos;une de ces catégories : Airbus Opérations, ayant droit Airbus
          Opérations, chômeur ou étudiant ?
        </legend>
        <div className="mt-1 flex gap-6">
          <label className="flex items-center gap-2 text-sm text-toac-blue-900">
            <input
              type="radio"
              name="tarifReduit"
              value="non"
              checked={tarifReduit === "non"}
              onChange={() => setTarifReduit("non")}
            />
            Non — adhésion plein tarif
          </label>
          <label className="flex items-center gap-2 text-sm text-toac-blue-900">
            <input
              type="radio"
              name="tarifReduit"
              value="oui"
              checked={tarifReduit === "oui"}
              onChange={() => setTarifReduit("oui")}
            />
            Oui — adhésion tarif réduit
          </label>
        </div>

        {tarifReduit === "oui" && (
          <div className="mt-4">
            <label htmlFor="justificatif" className={labelClass}>
              Justificatif (carte étudiante, attestation demandeur d&apos;emploi, badge Airbus…)
            </label>
            <input
              id="justificatif"
              name="justificatif"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              required
              className="w-full text-sm text-toac-blue-900 file:mr-3 file:rounded-md file:border-0 file:bg-toac-blue-950 file:px-4 file:py-2 file:text-sm file:text-white"
            />
            <p className="mt-1 text-xs text-toac-blue-900/60">
              PDF ou image, transmis au bureau avec votre dossier.
            </p>
          </div>
        )}
      </fieldset>

      <div>
        <label htmlFor="assurance" className={labelClass}>
          Assurance FFTRI 2026 (obligatoire — voir le détail des garanties sur{" "}
          <a
            href="https://www.fftri.com/pratiquer/se-licencier/assurance/assurance-2026/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            fftri.com
          </a>
          )
        </label>
        <select
          id="assurance"
          name="assurance"
          required
          value={assuranceId}
          onChange={(e) => setAssuranceId(e.target.value)}
          className={inputClass}
        >
          {ASSURANCE_TARIFS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
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

      <div className="rounded-md border border-toac-gray-200 bg-toac-gray-50 p-4 text-sm">
        <div className="flex justify-between text-toac-blue-900">
          <span>{tarif.label}</span>
          <span>{euros(tarif.montantCentimes)}</span>
        </div>
        <div className="mt-1 flex justify-between text-toac-blue-900">
          <span>{assurance.label}</span>
          <span>{euros(assurance.montantCentimes)}</span>
        </div>
        <div className="mt-1 flex justify-between text-toac-blue-900">
          <span>
            Caution Triathlons du Lauragais (obligatoire, restituée en fin de saison sous réserve
            d&apos;implication dans l&apos;organisation des Triathlons du Lauragais, 6-7 juin 2026)
          </span>
          <span>{euros(CAUTION_CENTIMES)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-toac-gray-200 pt-2 font-medium text-toac-blue-950">
          <span>Total à régler</span>
          <span>{euros(total)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-md bg-toac-pink-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400 disabled:opacity-60 sm:w-auto"
      >
        {sending ? "Redirection vers le paiement…" : `Valider et payer ${euros(total)}`}
      </button>
      <p className="text-xs text-toac-blue-900/60">
        Paiement sécurisé Monetico (Crédit Mutuel / CIC). Votre inscription est validée automatiquement
        dès confirmation du paiement.
      </p>
    </form>
  );
}
