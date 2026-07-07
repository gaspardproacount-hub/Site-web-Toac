import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Account, Member } from "./types";

const DATA_DIR = path.join(process.cwd(), "src", "data");

function readJsonWithFallback<T>(filename: string, fallback: string): T {
  const primary = path.join(DATA_DIR, filename);
  const fallbackPath = path.join(DATA_DIR, fallback);
  const target = fs.existsSync(primary) ? primary : fallbackPath;
  const raw = fs.readFileSync(target, "utf8");
  return JSON.parse(raw) as T;
}

/**
 * members.json est ignoré par git (voir .gitignore) : il contient les
 * vraies données des adhérents, importées depuis le CSV du club.
 * En son absence (installation fraîche), on retombe sur le jeu de
 * données factices members.sample.json.
 */
export function getMembers(): Member[] {
  return readJsonWithFallback<Member[]>("members.json", "members.sample.json");
}

export function getMemberById(id: string): Member | undefined {
  return getMembers().find((m) => m.id === id);
}

/**
 * accounts.json est ignoré par git pour la même raison que members.json.
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
