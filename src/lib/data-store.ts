import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Account } from "./types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readJsonWithFallback<T>(filename: string, fallback: string): T {
  const primary = path.join(DATA_DIR, filename);
  const fallbackPath = path.join(DATA_DIR, fallback);
  const target = fs.existsSync(primary) ? primary : fallbackPath;
  const raw = fs.readFileSync(target, "utf8");
  return JSON.parse(raw) as T;
}

/**
 * accounts.json contient des données sensibles (hachages de mots de passe) : il
 * est ignoré par git (voir .gitignore), donc absent du serveur déployé. En
 * développement, on retombe alors sur accounts.sample.json et ses comptes de
 * démonstration.
 *
 * En production ce repli est refusé : les hachages de accounts.sample.json sont
 * dans le dépôt, donc attaquables hors ligne, et l'un d'eux ouvre un compte
 * `admin` qui donne accès aux dossiers des adhérents. Sur le serveur, le compte
 * bureau passe par ADMIN_USERNAME / ADMIN_PASSWORD (voir src/lib/auth.ts).
 */
function sampleAccountsAllowed(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function getAccounts(): Account[] {
  const real = path.join(DATA_DIR, "accounts.json");
  if (!fs.existsSync(real) && !sampleAccountsAllowed()) return [];
  return readJsonWithFallback<Account[]>("accounts.json", "accounts.sample.json");
}

export function getAccountByUsername(username: string): Account | undefined {
  return getAccounts().find(
    (a) => a.username.toLowerCase() === username.toLowerCase()
  );
}
