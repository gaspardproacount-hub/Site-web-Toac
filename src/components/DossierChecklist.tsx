import type { MemberDossier } from "@/lib/types";

export const DOSSIER_LABELS: Record<keyof MemberDossier, string> = {
  paiement: "Paiement",
  formulaireAdhesion: "Formulaire d'adhésion",
  cheque: "Chèque (caution)",
  groupeGoogle: "Groupe Google",
  whatsapp: "WhatsApp",
  licenceDemandee: "Licence demandée",
  licencePayee: "Licence payée",
};

export function dossierCompletion(dossier: MemberDossier): number {
  const values = Object.values(dossier);
  const done = values.filter(Boolean).length;
  return Math.round((done / values.length) * 100);
}

export default function DossierChecklist({ dossier }: { dossier: MemberDossier }) {
  return (
    <ul className="divide-y divide-toac-gray-100">
      {(Object.keys(DOSSIER_LABELS) as Array<keyof MemberDossier>).map((key) => (
        <li key={key} className="flex items-center justify-between py-3">
          <span className="text-sm text-toac-blue-900">{DOSSIER_LABELS[key]}</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              dossier[key]
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-700"
            }`}
          >
            {dossier[key] ? "Oui" : "Non"}
          </span>
        </li>
      ))}
    </ul>
  );
}
