/**
 * CLI de gestion des comptes de l'espace adhérents (src/data/accounts.json,
 * ignoré par git). Toutes les commandes lisent/écrivent ce fichier.
 *
 * Usage :
 *   npm run accounts -- list
 *   npm run accounts -- add <username> <password> <"Nom Prénom"> <member|admin> [memberId]
 *   npm run accounts -- passwd <username> <nouveauMotDePasse>
 *   npm run accounts -- remove <username>
 *   npm run accounts -- bulk-from-members   (génère un compte pour chaque adhérent de members.json qui n'en a pas encore)
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { Account, Member } from "../src/lib/types";

const ACCOUNTS_PATH = path.join(process.cwd(), "src", "data", "accounts.json");
const MEMBERS_PATH = path.join(process.cwd(), "src", "data", "members.json");
const MEMBERS_SAMPLE_PATH = path.join(process.cwd(), "src", "data", "members.sample.json");

function loadAccounts(): Account[] {
  if (!fs.existsSync(ACCOUNTS_PATH)) return [];
  return JSON.parse(fs.readFileSync(ACCOUNTS_PATH, "utf8"));
}

function saveAccounts(accounts: Account[]) {
  fs.writeFileSync(ACCOUNTS_PATH, JSON.stringify(accounts, null, 2) + "\n", "utf8");
}

function loadMembers(): Member[] {
  const target = fs.existsSync(MEMBERS_PATH) ? MEMBERS_PATH : MEMBERS_SAMPLE_PATH;
  return JSON.parse(fs.readFileSync(target, "utf8"));
}

function generatePassword(): string {
  return crypto.randomBytes(6).toString("base64url");
}

function slugifyUsername(firstName: string, lastName: string): string {
  return `${firstName}.${lastName}`
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "");
}

async function cmdList() {
  const accounts = loadAccounts();
  console.table(
    accounts.map((a) => ({ username: a.username, name: a.name, role: a.role, memberId: a.memberId }))
  );
}

async function cmdAdd(args: string[]) {
  const [username, password, name, role, memberId] = args;
  if (!username || !password || !name || !role) {
    console.error(
      'Usage : npm run accounts -- add <username> <password> "<Nom Prénom>" <member|admin> [memberId]'
    );
    process.exit(1);
  }
  if (role !== "member" && role !== "admin") {
    console.error("Le rôle doit être 'member' ou 'admin'.");
    process.exit(1);
  }

  const accounts = loadAccounts();
  if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
    console.error(`Le compte "${username}" existe déjà.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  accounts.push({ username, passwordHash, name, role, memberId: memberId ?? null });
  saveAccounts(accounts);
  console.log(`✅ Compte "${username}" créé.`);
}

async function cmdPasswd(args: string[]) {
  const [username, newPassword] = args;
  if (!username || !newPassword) {
    console.error("Usage : npm run accounts -- passwd <username> <nouveauMotDePasse>");
    process.exit(1);
  }
  const accounts = loadAccounts();
  const account = accounts.find((a) => a.username.toLowerCase() === username.toLowerCase());
  if (!account) {
    console.error(`Compte "${username}" introuvable.`);
    process.exit(1);
  }
  account.passwordHash = await bcrypt.hash(newPassword, 10);
  saveAccounts(accounts);
  console.log(`✅ Mot de passe mis à jour pour "${username}".`);
}

async function cmdRemove(args: string[]) {
  const [username] = args;
  if (!username) {
    console.error("Usage : npm run accounts -- remove <username>");
    process.exit(1);
  }
  const accounts = loadAccounts();
  const next = accounts.filter((a) => a.username.toLowerCase() !== username.toLowerCase());
  if (next.length === accounts.length) {
    console.error(`Compte "${username}" introuvable.`);
    process.exit(1);
  }
  saveAccounts(next);
  console.log(`✅ Compte "${username}" supprimé.`);
}

async function cmdBulkFromMembers() {
  const members = loadMembers();
  const accounts = loadAccounts();
  const existingMemberIds = new Set(accounts.map((a) => a.memberId));
  const created: { username: string; password: string; name: string }[] = [];

  for (const member of members) {
    if (existingMemberIds.has(member.id)) continue;
    const username = slugifyUsername(member.firstName, member.lastName);
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    accounts.push({
      username,
      passwordHash,
      name: `${member.firstName} ${member.lastName}`,
      role: "member",
      memberId: member.id,
    });
    created.push({ username, password, name: `${member.firstName} ${member.lastName}` });
  }

  saveAccounts(accounts);
  console.log(`✅ ${created.length} comptes créés.`);
  console.log("Transmettez ces identifiants aux adhérents concernés (à usage unique, non stockés en clair) :");
  console.table(created);
}

async function main() {
  const [, , command, ...args] = process.argv;

  switch (command) {
    case "list":
      return cmdList();
    case "add":
      return cmdAdd(args);
    case "passwd":
      return cmdPasswd(args);
    case "remove":
      return cmdRemove(args);
    case "bulk-from-members":
      return cmdBulkFromMembers();
    default:
      console.log(
        [
          "Commandes disponibles :",
          "  list",
          "  add <username> <password> \"<Nom Prénom>\" <member|admin> [memberId]",
          "  passwd <username> <nouveauMotDePasse>",
          "  remove <username>",
          "  bulk-from-members",
        ].join("\n")
      );
  }
}

main();
