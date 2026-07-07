export type MemberStatus = "new" | "membre" | "bureau" | "arbitre";

export interface MemberDossier {
  paiement: boolean;
  formulaireAdhesion: boolean;
  cheque: boolean;
  groupeGoogle: boolean;
  whatsapp: boolean;
  licenceDemandee: boolean;
  licencePayee: boolean;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: MemberStatus;
  dossier: MemberDossier;
}

export type AccountRole = "member" | "admin";

export interface Account {
  username: string;
  passwordHash: string;
  name: string;
  role: AccountRole;
  memberId: string | null;
}
