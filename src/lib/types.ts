export type MemberStatus = "new" | "membre" | "bureau" | "arbitre";

export interface MemberDossier {
  paiement: boolean;
  formulaireAdhesion: boolean;
  /** Caution de 100€ — auparavant encaissée par chèque, désormais prélevée automatiquement via Monetico en même temps que la cotisation. */
  caution: boolean;
  groupeGoogle: boolean;
  whatsapp: boolean;
  licenceDemandee: boolean;
  licencePayee: boolean;
  /** Justificatif tarif réduit (étudiant, demandeur d'emploi, salarié Airbus opération ou ayant droit…). */
  justificatif: boolean;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: MemberStatus;
  dossier: MemberDossier;
  /** URL du justificatif tarif réduit uploadé (Vercel Blob), le cas échéant. */
  justificatifUrl: string | null;
}

export type AccountRole = "member" | "admin";

export interface Account {
  username: string;
  passwordHash: string;
  name: string;
  role: AccountRole;
  memberId: string | null;
}
