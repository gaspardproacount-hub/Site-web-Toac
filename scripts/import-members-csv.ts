/**
 * Importe le CSV exporté depuis le Google Sheets "Dossiers-2025-2026" du
 * club directement dans la base de données du site (table `members`) —
 * les vraies données personnelles ne transitent donc jamais par git.
 *
 * Usage (en local, avec DATABASE_URL renseignée dans .env.local — la même
 * valeur que celle configurée sur Vercel) :
 *   npm run import-csv -- chemin/vers/export.csv
 *
 * Ré-exécutable sans risque : chaque ligne est identifiée par le nom/prénom
 * (une ré-importation met à jour le dossier existant au lieu de le dupliquer)
 * — l'export du club n'a pas de colonne email.
 *
 * Colonnes attendues (l'ordre n'importe pas, les en-têtes sont insensibles
 * à la casse et aux accents) : Nom, Prénom, statut, Pay asso (paiement de
 * la cotisation), Formulaire adhésion, justif (justificatif tarif réduit),
 * Chèque (→ caution), GG Group, Whatsapp, Licence demandée, Licence payée.
 * Email est optionnel (absent de l'export actuel du club).
 * Les colonnes booléennes acceptent "Oui"/"Non", "true"/"false", "1"/"0".
 * Les lignes de total/pourcentage en haut du fichier sont ignorées
 * automatiquement.
 */
import fs from "node:fs";
import path from "node:path";
import { loadEnvLocal } from "./load-env";
import { upsertMemberFromCsv, closeDb } from "../src/lib/db";
import type { MemberDossier, MemberStatus } from "../src/lib/types";

loadEnvLocal();

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (inQuotes) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && content[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toBool(value: string | undefined): boolean {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return v === "oui" || v === "true" || v === "1" || v === "yes";
}

function toStatus(value: string | undefined): MemberStatus {
  const v = (value ?? "").trim().toLowerCase();
  if (v === "membre" || v === "bureau" || v === "arbitre" || v === "new") return v;
  return "new";
}

const HEADER_MAP: Record<string, string> = {
  prenom: "firstName",
  nom: "lastName",
  email: "email",
  statut: "status",
  paiement: "paiement",
  payasso: "paiement",
  formulairedadhesion: "formulaireAdhesion",
  formulaireadhesion: "formulaireAdhesion",
  justif: "justificatif",
  cheque: "caution",
  caution: "caution",
  groupegoogle: "groupeGoogle",
  gggroup: "groupeGoogle",
  whatsapp: "whatsapp",
  licencedemandee: "licenceDemandee",
  licencepayee: "licencePayee",
};

const IGNORED_LAST_NAMES = new Set(["TOTAL", "OUI", "NON", "MANQUANTS"]);

/** Filtre les lignes de total/pourcentage qui traînent en haut ou juste sous l'en-tête de l'export du club. */
function isRealMemberRow(lastName: string, firstName: string): boolean {
  if (!lastName || !firstName) return false;
  if (IGNORED_LAST_NAMES.has(lastName.toUpperCase())) return false;
  if (/^\d/.test(firstName)) return false;
  return true;
}

/**
 * L'export du club place la vraie ligne d'en-tête après un bloc de
 * synthèse (total/pourcentage manquants) : on la retrouve en cherchant la
 * ligne qui contient à la fois une colonne Nom et une colonne Prénom,
 * plutôt que de supposer que c'est la première ligne du fichier.
 */
function findHeaderRowIndex(rows: string[][]): number {
  const index = rows.findIndex((row) => {
    const mapped = row.map((h) => HEADER_MAP[normalizeHeader(h)] ?? null);
    return mapped.includes("firstName") && mapped.includes("lastName");
  });
  if (index === -1) {
    console.error("Impossible de trouver la ligne d'en-tête (colonnes Nom/Prénom) dans le fichier.");
    process.exit(1);
  }
  return index;
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage : npm run import-csv -- chemin/vers/export.csv");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL n'est pas définie. Ajoutez-la dans .env.local (même valeur que sur Vercel) avant d'importer."
    );
    process.exit(1);
  }

  const content = fs.readFileSync(path.resolve(csvPath), "utf8");
  const rows = parseCsv(content);
  const headerIndex = findHeaderRowIndex(rows);
  const headerRow = rows[headerIndex];
  const dataRows = rows.slice(headerIndex + 1);
  const headers = headerRow.map((h) => HEADER_MAP[normalizeHeader(h)] ?? null);

  let imported = 0;
  let skipped = 0;
  for (const row of dataRows) {
    const record: Record<string, string> = {};
    headers.forEach((key, i) => {
      if (key) record[key] = row[i] ?? "";
    });

    const firstName = (record.firstName ?? "").trim();
    const lastName = (record.lastName ?? "").trim();
    if (!isRealMemberRow(lastName, firstName)) {
      skipped++;
      continue;
    }

    const dossier: MemberDossier = {
      paiement: toBool(record.paiement),
      formulaireAdhesion: toBool(record.formulaireAdhesion),
      caution: toBool(record.caution),
      groupeGoogle: toBool(record.groupeGoogle),
      whatsapp: toBool(record.whatsapp),
      licenceDemandee: toBool(record.licenceDemandee),
      licencePayee: toBool(record.licencePayee),
      justificatif: toBool(record.justificatif),
    };

    await upsertMemberFromCsv({
      firstName,
      lastName,
      email: record.email ?? "",
      status: toStatus(record.status),
      dossier,
    });
    imported++;
  }

  await closeDb();
  console.log(`✅ ${imported} adhérents importés/mis à jour dans la base de données (${skipped} lignes ignorées).`);
}

main().catch((error) => {
  console.error("Échec de l'import :", error);
  process.exit(1);
});
