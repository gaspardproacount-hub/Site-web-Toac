/**
 * Importe le CSV exporté depuis le Google Sheets "Dossiers-2025-2026" du
 * club et génère src/data/members.json (ignoré par git — jamais committé).
 *
 * Usage :
 *   npm run import-csv -- chemin/vers/export.csv
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
import type { Member, MemberDossier, MemberStatus } from "../src/lib/types";

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

function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage : npm run import-csv -- chemin/vers/export.csv");
    process.exit(1);
  }

  const content = fs.readFileSync(path.resolve(csvPath), "utf8");
  const rows = parseCsv(content);
  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((h) => HEADER_MAP[normalizeHeader(h)] ?? null);

  const members: Member[] = dataRows.map((row, index) => {
    const record: Record<string, string> = {};
    headers.forEach((key, i) => {
      if (key) record[key] = row[i] ?? "";
    });

    const dossier: MemberDossier = {
      paiement: toBool(record.paiement),
      formulaireAdhesion: toBool(record.formulaireAdhesion),
      cheque: toBool(record.cheque),
      groupeGoogle: toBool(record.groupeGoogle),
      whatsapp: toBool(record.whatsapp),
      licenceDemandee: toBool(record.licenceDemandee),
      licencePayee: toBool(record.licencePayee),
    };

    return {
      id: `m-${String(index + 1).padStart(3, "0")}`,
      firstName: record.firstName ?? "",
      lastName: record.lastName ?? "",
      email: record.email ?? "",
      status: toStatus(record.status),
      dossier,
    };
  });

  const outputPath = path.join(process.cwd(), "src", "data", "members.json");
  fs.writeFileSync(outputPath, JSON.stringify(members, null, 2) + "\n", "utf8");
  console.log(`✅ ${members.length} adhérents importés vers ${outputPath}`);
  console.log(
    "⚠️  Ce fichier contient des données personnelles : il est ignoré par git (.gitignore) — ne le committez jamais dans un dépôt public."
  );
}

main();
