import type { NextRequest } from "next/server";
import { serveDocument } from "@/lib/serveDocument";

/**
 * Même service que /api/documents, avec le nom du fichier dans le chemin.
 *
 * Ce segment ne sert qu'à l'affichage : le lecteur PDF de Chrome titre son
 * onglet d'après le dernier segment de l'URL, en ignorant la métadonnée `/Title`
 * du document comme le `filename` de l'en-tête Content-Disposition. Sans lui,
 * tous les documents apparaissent sous le nom « documents ».
 *
 * Il n'entre jamais dans la résolution du fichier — celle-ci passe uniquement
 * par le paramètre `path`, validé dans serveDocument — et n'est donc pas lu ici.
 */
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  return serveDocument(request);
}
