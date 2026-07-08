import { Pool } from "pg";
import type { Member, MemberDossier, MemberStatus } from "./types";

/**
 * Base de données Postgres (Neon, Vercel Postgres, Supabase… n'importe quel
 * Postgres standard convient) utilisée pour stocker automatiquement :
 *  - les commandes de paiement Monetico (table `commandes`), reçues via
 *    la notification serveur-à-serveur (IPN) — voir
 *    src/app/api/monetico/retour/route.ts ;
 *  - les inscriptions du formulaire d'adhésion en ligne (table
 *    `inscriptions`) — voir src/app/api/adhesion/route.ts.
 *
 * Configuration : renseignez DATABASE_URL (chaîne de connexion Postgres,
 * ex. fournie par Vercel/Neon, Supabase…) dans les variables d'environnement.
 * Tant que DATABASE_URL n'est pas définie, les fonctions ci-dessous lèvent
 * une erreur explicite, interceptée par les pages/API qui les appellent
 * pour afficher un message d'installation plutôt que de planter le site.
 *
 * Pas de garde `import "server-only"` ici (contrairement aux autres modules
 * de src/lib) : ce module est aussi importé directement par les scripts CLI
 * (scripts/import-members-csv.ts, scripts/manage-accounts.ts) exécutés avec
 * `tsx`, hors du bundler Next — `server-only` y lève toujours une erreur. La
 * dépendance `pg` (Node uniquement) empêche de toute façon tout bundling
 * accidentel côté client.
 */

let pool: Pool | null = null;

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "DATABASE_URL n'est pas configurée. Renseignez cette variable d'environnement " +
        "(voir .env.example et le README, section base de données) pour activer le suivi " +
        "automatique des commandes et inscriptions."
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new DatabaseNotConfiguredError();
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("sslmode=") ? undefined : { rejectUnauthorized: false },
      // Une seule connexion à la fois et des délais courts : chaque appel de
      // fonction serverless (Vercel) est une exécution isolée et de courte
      // durée, ce qui ne se marie pas bien avec un pool multi-connexions
      // classique. Cela évite aussi de rester bloqué trop longtemps si la
      // base vient de sortir de veille (Neon "scale to zero").
      max: 1,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 10000,
    });
    // Une connexion qui échoue en arrière-plan (socket coupé entre deux
    // invocations serverless) ne doit pas faire planter le process : on
    // la journalise et on repartira sur une nouvelle connexion au prochain
    // appel.
    pool.on("error", (error) => {
      console.error("Erreur de connexion PostgreSQL (pool) :", error);
    });
  }
  return pool;
}

let schemaReady: Promise<void> | null = null;

/** Crée les tables si elles n'existent pas encore (idempotent, appelé avant chaque requête). */
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = getPool()
      .query(
        `
        CREATE TABLE IF NOT EXISTS commandes (
          id SERIAL PRIMARY KEY,
          reference TEXT UNIQUE NOT NULL,
          recu_le TIMESTAMPTZ NOT NULL DEFAULT now(),
          date_paiement TEXT,
          email TEXT,
          montant_centimes INTEGER,
          devise TEXT,
          statut TEXT NOT NULL,
          code_retour TEXT,
          marque_carte TEXT,
          numero_autorisation TEXT,
          texte_libre TEXT,
          brut JSONB NOT NULL
        );

        CREATE TABLE IF NOT EXISTS inscriptions (
          id SERIAL PRIMARY KEY,
          recue_le TIMESTAMPTZ NOT NULL DEFAULT now(),
          statut TEXT NOT NULL DEFAULT 'nouveau',
          prenom TEXT NOT NULL,
          nom TEXT NOT NULL,
          date_naissance TEXT,
          email TEXT NOT NULL,
          telephone TEXT,
          adresse TEXT,
          formule TEXT,
          licence_existante TEXT,
          contact_urgence_nom TEXT,
          contact_urgence_telephone TEXT,
          certificat_medical TEXT,
          droit_image BOOLEAN NOT NULL DEFAULT false,
          message TEXT,
          member_id INTEGER,
          justificatif_url TEXT
        );

        CREATE TABLE IF NOT EXISTS members (
          id SERIAL PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          name_key TEXT,
          email TEXT,
          status TEXT NOT NULL DEFAULT 'new',
          paiement BOOLEAN NOT NULL DEFAULT false,
          formulaire_adhesion BOOLEAN NOT NULL DEFAULT false,
          caution BOOLEAN NOT NULL DEFAULT false,
          groupe_google BOOLEAN NOT NULL DEFAULT false,
          whatsapp BOOLEAN NOT NULL DEFAULT false,
          licence_demandee BOOLEAN NOT NULL DEFAULT false,
          licence_payee BOOLEAN NOT NULL DEFAULT false,
          justificatif BOOLEAN NOT NULL DEFAULT false,
          justificatif_url TEXT,
          cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        -- Migration idempotente pour les bases créées avant l'ajout de
        -- name_key/caution/justificatif (voir historique du dépôt) : sans
        -- effet si la table members a déjà le schéma ci-dessus.
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'members' AND column_name = 'cheque'
          ) THEN
            ALTER TABLE members RENAME COLUMN cheque TO caution;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'members' AND column_name = 'justificatif'
          ) THEN
            ALTER TABLE members ADD COLUMN justificatif BOOLEAN NOT NULL DEFAULT false;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'members' AND column_name = 'justificatif_url'
          ) THEN
            ALTER TABLE members ADD COLUMN justificatif_url TEXT;
          END IF;

          IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'members' AND constraint_name = 'members_email_key'
          ) THEN
            ALTER TABLE members DROP CONSTRAINT members_email_key;
          END IF;

          ALTER TABLE members ALTER COLUMN email DROP NOT NULL;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'members' AND column_name = 'name_key'
          ) THEN
            ALTER TABLE members ADD COLUMN name_key TEXT;
          END IF;

          UPDATE members
          SET name_key = lower(regexp_replace(last_name, '[^a-zA-Z0-9]', '', 'g'))
            || '|' || lower(regexp_replace(first_name, '[^a-zA-Z0-9]', '', 'g'))
          WHERE name_key IS NULL;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE table_name = 'members' AND constraint_name = 'members_name_key_key'
          ) THEN
            ALTER TABLE members ADD CONSTRAINT members_name_key_key UNIQUE (name_key);
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'inscriptions' AND column_name = 'member_id'
          ) THEN
            ALTER TABLE inscriptions ADD COLUMN member_id INTEGER;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'inscriptions' AND column_name = 'justificatif_url'
          ) THEN
            ALTER TABLE inscriptions ADD COLUMN justificatif_url TEXT;
          END IF;
        END $$;
        `
      )
      .then(() => undefined);
  }
  return schemaReady;
}

export interface CommandeRow {
  id: number;
  reference: string;
  recu_le: string;
  date_paiement: string | null;
  email: string | null;
  montant_centimes: number | null;
  devise: string | null;
  statut: string;
  code_retour: string | null;
  marque_carte: string | null;
  numero_autorisation: string | null;
  texte_libre: string | null;
  brut: Record<string, string>;
}

export interface NouvelleCommande {
  reference: string;
  datePaiement: string | null;
  email: string | null;
  montantCentimes: number | null;
  devise: string | null;
  statut: string;
  codeRetour: string | null;
  marqueCarte: string | null;
  numeroAutorisation: string | null;
  texteLibre: string | null;
  brut: Record<string, string>;
}

/** Enregistre (ou met à jour) une commande reçue via l'IPN Monetico. */
export async function upsertCommande(commande: NouvelleCommande): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `
    INSERT INTO commandes (
      reference, date_paiement, email, montant_centimes, devise, statut,
      code_retour, marque_carte, numero_autorisation, texte_libre, brut
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (reference) DO UPDATE SET
      date_paiement = EXCLUDED.date_paiement,
      email = EXCLUDED.email,
      montant_centimes = EXCLUDED.montant_centimes,
      devise = EXCLUDED.devise,
      statut = EXCLUDED.statut,
      code_retour = EXCLUDED.code_retour,
      marque_carte = EXCLUDED.marque_carte,
      numero_autorisation = EXCLUDED.numero_autorisation,
      texte_libre = EXCLUDED.texte_libre,
      brut = EXCLUDED.brut
    `,
    [
      commande.reference,
      commande.datePaiement,
      commande.email,
      commande.montantCentimes,
      commande.devise,
      commande.statut,
      commande.codeRetour,
      commande.marqueCarte,
      commande.numeroAutorisation,
      commande.texteLibre,
      JSON.stringify(commande.brut),
    ]
  );
}

export async function getCommandes(): Promise<CommandeRow[]> {
  await ensureSchema();
  const { rows } = await getPool().query<CommandeRow>(
    "SELECT * FROM commandes ORDER BY recu_le DESC"
  );
  return rows;
}

export interface InscriptionRow {
  id: number;
  recue_le: string;
  statut: string;
  prenom: string;
  nom: string;
  date_naissance: string | null;
  email: string;
  telephone: string | null;
  adresse: string | null;
  formule: string | null;
  licence_existante: string | null;
  contact_urgence_nom: string | null;
  contact_urgence_telephone: string | null;
  certificat_medical: string | null;
  droit_image: boolean;
  message: string | null;
  member_id: number | null;
  justificatif_url: string | null;
}

export interface NouvelleInscription {
  prenom: string;
  nom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  adresse: string;
  formule: string;
  licenceExistante: string;
  contactUrgenceNom: string;
  contactUrgenceTelephone: string;
  certificatMedical: string;
  droitImage: boolean;
  message: string;
  memberId: number | null;
  justificatifUrl: string | null;
}

export async function insertInscription(inscription: NouvelleInscription): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `
    INSERT INTO inscriptions (
      prenom, nom, date_naissance, email, telephone, adresse, formule,
      licence_existante, contact_urgence_nom, contact_urgence_telephone,
      certificat_medical, droit_image, message, member_id, justificatif_url
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
    `,
    [
      inscription.prenom,
      inscription.nom,
      inscription.dateNaissance,
      inscription.email,
      inscription.telephone,
      inscription.adresse,
      inscription.formule,
      inscription.licenceExistante,
      inscription.contactUrgenceNom,
      inscription.contactUrgenceTelephone,
      inscription.certificatMedical,
      inscription.droitImage,
      inscription.message,
      inscription.memberId,
      inscription.justificatifUrl,
    ]
  );
}

export async function getInscriptions(): Promise<InscriptionRow[]> {
  await ensureSchema();
  const { rows } = await getPool().query<InscriptionRow>(
    "SELECT * FROM inscriptions ORDER BY recue_le DESC"
  );
  return rows;
}

interface MemberRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  status: string;
  paiement: boolean;
  formulaire_adhesion: boolean;
  caution: boolean;
  groupe_google: boolean;
  whatsapp: boolean;
  licence_demandee: boolean;
  licence_payee: boolean;
  justificatif: boolean;
  justificatif_url: string | null;
}

/**
 * Clé de rapprochement par nom (insensible à la casse et aux accents) :
 * l'export du club n'a pas de colonne email, et un même adhérent peut
 * remplir le formulaire en ligne avec une adresse différente d'une année
 * sur l'autre — le nom reste le repère stable entre l'import CSV et les
 * inscriptions en ligne.
 */
function nameKey(firstName: string, lastName: string): string {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  return `${normalize(lastName)}|${normalize(firstName)}`;
}

function toMember(row: MemberRow): Member {
  return {
    id: String(row.id),
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email ?? "",
    status: row.status as MemberStatus,
    dossier: {
      paiement: row.paiement,
      formulaireAdhesion: row.formulaire_adhesion,
      caution: row.caution,
      groupeGoogle: row.groupe_google,
      whatsapp: row.whatsapp,
      licenceDemandee: row.licence_demandee,
      licencePayee: row.licence_payee,
      justificatif: row.justificatif,
    },
    justificatifUrl: row.justificatif_url,
  };
}

/** Tous les dossiers adhérents (import CSV + inscriptions en ligne), pour la vue bureau. */
export async function getMembers(): Promise<Member[]> {
  await ensureSchema();
  const { rows } = await getPool().query<MemberRow>(
    "SELECT * FROM members ORDER BY last_name, first_name"
  );
  return rows.map(toMember);
}

export async function getMemberById(id: string): Promise<Member | null> {
  await ensureSchema();
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;
  const { rows } = await getPool().query<MemberRow>(
    "SELECT * FROM members WHERE id = $1",
    [numericId]
  );
  return rows[0] ? toMember(rows[0]) : null;
}

export interface CsvMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  status: MemberStatus;
  dossier: MemberDossier;
}

/** Insère ou met à jour (par nom) un adhérent importé depuis le CSV du club. */
export async function upsertMemberFromCsv(m: CsvMemberInput): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `
    INSERT INTO members (
      first_name, last_name, name_key, email, status, paiement, formulaire_adhesion,
      caution, groupe_google, whatsapp, licence_demandee, licence_payee, justificatif
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (name_key) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = COALESCE(NULLIF(EXCLUDED.email, ''), members.email),
      status = EXCLUDED.status,
      paiement = EXCLUDED.paiement,
      formulaire_adhesion = EXCLUDED.formulaire_adhesion,
      caution = EXCLUDED.caution,
      groupe_google = EXCLUDED.groupe_google,
      whatsapp = EXCLUDED.whatsapp,
      licence_demandee = EXCLUDED.licence_demandee,
      licence_payee = EXCLUDED.licence_payee,
      justificatif = EXCLUDED.justificatif
    `,
    [
      m.firstName,
      m.lastName,
      nameKey(m.firstName, m.lastName),
      m.email || null,
      m.status,
      m.dossier.paiement,
      m.dossier.formulaireAdhesion,
      m.dossier.caution,
      m.dossier.groupeGoogle,
      m.dossier.whatsapp,
      m.dossier.licenceDemandee,
      m.dossier.licencePayee,
      m.dossier.justificatif,
    ]
  );
}

/**
 * Crée (ou retrouve, par nom) le dossier adhérent correspondant à une
 * demande d'adhésion en ligne — c'est ce qui fait apparaître automatiquement
 * les nouveaux inscrits dans la vue bureau, sans ré-import CSV. Renvoie
 * l'identifiant du dossier (utilisé pour le rapprocher de la commande
 * Monetico correspondante).
 */
export async function upsertMemberFromInscription(inscription: {
  prenom: string;
  nom: string;
  email: string;
  justificatif: boolean;
  justificatifUrl: string | null;
}): Promise<number> {
  await ensureSchema();
  const { rows } = await getPool().query<{ id: number }>(
    `
    INSERT INTO members (first_name, last_name, name_key, email, status, formulaire_adhesion, justificatif, justificatif_url)
    VALUES ($1, $2, $3, $4, 'new', true, $5, $6)
    ON CONFLICT (name_key) DO UPDATE SET
      email = COALESCE(NULLIF(EXCLUDED.email, ''), members.email),
      formulaire_adhesion = true,
      justificatif = EXCLUDED.justificatif OR members.justificatif,
      justificatif_url = COALESCE(EXCLUDED.justificatif_url, members.justificatif_url)
    RETURNING id
    `,
    [
      inscription.prenom,
      inscription.nom,
      nameKey(inscription.prenom, inscription.nom),
      inscription.email || null,
      inscription.justificatif,
      inscription.justificatifUrl,
    ]
  );
  return rows[0].id;
}

/** Marque le dossier payé + caution réglée suite à une notification Monetico acceptée. */
export async function markMemberPaid(memberId: number): Promise<void> {
  await ensureSchema();
  await getPool().query(
    "UPDATE members SET paiement = true, caution = true WHERE id = $1",
    [memberId]
  );
}

export interface MemberPatch {
  status?: MemberStatus;
  paiement?: boolean;
  formulaireAdhesion?: boolean;
  caution?: boolean;
  groupeGoogle?: boolean;
  whatsapp?: boolean;
  licenceDemandee?: boolean;
  licencePayee?: boolean;
  justificatif?: boolean;
}

const PATCH_COLUMN: Record<keyof MemberPatch, string> = {
  status: "status",
  paiement: "paiement",
  formulaireAdhesion: "formulaire_adhesion",
  caution: "caution",
  groupeGoogle: "groupe_google",
  whatsapp: "whatsapp",
  licenceDemandee: "licence_demandee",
  licencePayee: "licence_payee",
  justificatif: "justificatif",
};

/** Met à jour un ou plusieurs champs du dossier (coché depuis la vue bureau). */
export async function updateMember(id: string, patch: MemberPatch): Promise<void> {
  await ensureSchema();
  const entries = (Object.entries(patch) as [keyof MemberPatch, MemberPatch[keyof MemberPatch]][]).filter(
    ([, value]) => value !== undefined
  );
  if (entries.length === 0) return;

  const setClauses = entries.map(([key], i) => `${PATCH_COLUMN[key]} = $${i + 2}`);
  const values = entries.map(([, value]) => value);
  await getPool().query(
    `UPDATE members SET ${setClauses.join(", ")} WHERE id = $1`,
    [Number(id), ...values]
  );
}

/** Supprime un dossier adhérent (depuis la vue bureau). */
export async function deleteMember(id: string): Promise<void> {
  await ensureSchema();
  await getPool().query("DELETE FROM members WHERE id = $1", [Number(id)]);
}

/** Ferme la connexion — à appeler en fin d'exécution des scripts CLI (import CSV…). */
export async function closeDb(): Promise<void> {
  if (pool) await pool.end();
}
