import type { MemberDossier } from "@/lib/types";

export interface DossierColumn {
  key: string;
  label: string;
  /** Champs du dossier que cette colonne regroupe (pour les cocher/décocher ensemble). */
  fields: Array<keyof MemberDossier>;
}

/**
 * Vue groupée du dossier : paiement, formulaire d'adhésion et caution sont
 * désormais réglés en une seule fois (formulaire d'adhésion unique avec
 * paiement intégré), donc affichés comme une seule étape "Inscription"
 * plutôt que trois cases séparées.
 */
export const DOSSIER_COLUMNS: DossierColumn[] = [
  {
    key: "inscription",
    label: "Inscription (formulaire + paiement + caution)",
    fields: ["paiement", "formulaireAdhesion", "caution"],
  },
  { key: "groupeGoogle", label: "Groupe Google", fields: ["groupeGoogle"] },
  { key: "whatsapp", label: "WhatsApp", fields: ["whatsapp"] },
  { key: "licenceDemandee", label: "Licence demandée", fields: ["licenceDemandee"] },
  { key: "licencePayee", label: "Licence payée", fields: ["licencePayee"] },
  { key: "justificatif", label: "Justificatif tarif réduit", fields: ["justificatif"] },
];

export function isColumnChecked(dossier: MemberDossier, column: DossierColumn): boolean {
  return column.fields.every((field) => dossier[field]);
}

export function dossierCompletion(dossier: MemberDossier): number {
  const done = DOSSIER_COLUMNS.filter((c) => isColumnChecked(dossier, c)).length;
  return Math.round((done / DOSSIER_COLUMNS.length) * 100);
}

export default function DossierChecklist({ dossier }: { dossier: MemberDossier }) {
  return (
    <ul className="divide-y divide-toac-gray-100">
      {DOSSIER_COLUMNS.map((column) => {
        const checked = isColumnChecked(dossier, column);
        return (
          <li key={column.key} className="flex items-center justify-between py-3">
            <span className="text-sm text-toac-blue-900">{column.label}</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                checked ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"
              }`}
            >
              {checked ? "Oui" : "Non"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
