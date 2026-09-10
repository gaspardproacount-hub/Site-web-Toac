import type { NextRequest } from "next/server";
import { serveDocument } from "@/lib/serveDocument";

/**
 * Forme sans nom de fichier. Conservée pour les liens déjà partagés — emails
 * envoyés au bureau, liens de relecture ouverts par des adhérents — qui pointent
 * tous vers cette URL. Les nouveaux liens passent par /api/documents/<nom>.
 */
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  return serveDocument(request);
}
