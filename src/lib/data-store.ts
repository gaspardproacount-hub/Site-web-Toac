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
 * accounts.json contient des données sensibles (hash de mot de passe) : il est ignoré par git.
 * En son absence, on retombe sur accounts.sample.json (compte demo/bureau).
 */
export function getAccounts(): Account[] {
  return readJsonWithFallback<Account[]>("accounts.json", "accounts.sample.json");
}

export function getAccountByUsername(username: string): Account | undefined {
  return getAccounts().find(
    (a) => a.username.toLowerCase() === username.toLowerCase()
  );
}
