import "server-only";
import bcrypt from "bcryptjs";
import { getAccountByUsername } from "./data-store";
import { createSessionToken } from "./session";
import type { Account } from "./types";

export async function authenticate(
  username: string,
  password: string
): Promise<Account | null> {
  const account = getAccountByUsername(username.trim());
  if (!account) return null;

  const valid = await bcrypt.compare(password, account.passwordHash);
  if (!valid) return null;

  return account;
}

export function buildSessionTokenForAccount(account: Account): string {
  return createSessionToken({
    username: account.username,
    name: account.name,
    role: account.role,
    memberId: account.memberId,
  });
}
