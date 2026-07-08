/**
 * Importe le CSV exporté depuis le Google Sheets "Dossiers-2025-2026" du
 * club directement dans la base de données du site (table `members`) —
 * les vraies données personnelles ne transitent donc jamais par git.
 *
 * Usage (en local, avec DATABASE_URL renseignée dans .env.local — la même
 * valeur que celle configurée sur Vercel) :
 *   npm run import-csv -- chemin/vers/export.csv
 *
 * Ré-exécutable sans risque : chaque ligne est identifiée par son email
 * (une ré-importation met à jour le dossier existant au lieu de le dupliquer).
 *
 * Colonnes attendues (l'ordre n'importe pas, les en-têtes sont
 * insensibles à la casse et aux accents) :
 *   Prénom, Nom, Email, Statut,
 *   Paiement, Formulaire d'adhésion, Chèque, Groupe Google, WhatsApp,
 *   Licence demandée, Licence payée
 * Les colonnes booléennes acceptent "Oui"/"Non", "true"/"false", "1"/"0".
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
  formulairedadhesion: "formulaireAdhesion",
  formulaireadhesion: "formulaireAdhesion",
  cheque: "cheque",
  groupegoogle: "groupeGoogle",
  whatsapp: "whatsapp",
  licencedemandee: "licenceDemandee",
  licencepayee: "licencePayee",
};

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
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((h) => HEADER_MAP[normalizeHeader(h)] ?? null);

  let imported = 0;
  for (const row of dataRows) {
    const record: Record<string, string> = {};
    headers.forEach((key, i) => {
      if (key) record[key] = row[i] ?? "";
    });
    if (!record.email) continue;

    const dossier: MemberDossier = {
      paiement: toBool(record.paiement),
      formulaireAdhesion: toBool(record.formulaireAdhesion),
      cheque: toBool(record.cheque),
      groupeGoogle: toBool(record.groupeGoogle),
      whatsapp: toBool(record.whatsapp),
      licenceDemandee: toBool(record.licenceDemandee),
      licencePayee: toBool(record.licencePayee),
    };

    await upsertMemberFromCsv({
      firstName: record.firstName ?? "",
      lastName: record.lastName ?? "",
      email: record.email,
      status: toStatus(record.status),
      dossier,
    });
    imported++;
  }

  await closeDb();
  console.log(`✅ ${imported} adhérents importés/mis à jour dans la base de données.`);
}

main().catch((error) => {
  console.error("Échec de l'import :", error);
  process.exit(1);
});
