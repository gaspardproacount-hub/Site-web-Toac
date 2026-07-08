import "server-only";
import { Pool } from "pg";

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
          message TEXT
        );
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
}

export async function insertInscription(inscription: NouvelleInscription): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `
    INSERT INTO inscriptions (
      prenom, nom, date_naissance, email, telephone, adresse, formule,
      licence_existante, contact_urgence_nom, contact_urgence_telephone,
      certificat_medical, droit_image, message
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
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
