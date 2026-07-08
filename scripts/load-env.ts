import fs from "node:fs";
import path from "node:path";

/**
 * Charge .env.local dans process.env pour les scripts CLI (contrairement à
 * `next dev`/`next build`, `tsx` ne le fait pas automatiquement). Nécessaire
 * pour que ces scripts puissent utiliser DATABASE_URL.
 */
export function loadEnvLocal(): void {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const match = /^\s*([\w.-]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const key = match[1];
    let value = match[2] ?? "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
