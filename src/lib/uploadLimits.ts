/**
 * Limites de taille des envois de fichiers.
 *
 * Vercel refuse tout corps de requête dépassant 4,5 Mo à l'entrée d'une
 * fonction : la connexion est coupée avant que le code serveur ne soit appelé,
 * et le navigateur ne voit qu'un échec de `fetch` — d'où le message « Erreur
 * réseau » sans plus d'explication. La vérification doit donc se faire côté
 * client, AVANT l'envoi, sur le total des fichiers joints.
 *
 * On garde une marge sous les 4,5 Mo pour les champs texte du formulaire et
 * l'encodage multipart, qui comptent dans le même total.
 */

/** Plafond réel imposé par la plateforme au corps d'une requête. */
export const PLATFORM_REQUEST_LIMIT_BYTES = 4.5 * 1024 * 1024;

/** Total des fichiers accepté par le formulaire, marge comprise. */
export const MAX_UPLOAD_TOTAL_BYTES = 4 * 1024 * 1024;

/**
 * Au-delà de cette taille, une image est recompressée côté client avant l'envoi
 * (voir src/lib/imageCompression.ts). Une photo de certificat prise au
 * smartphone pèse couramment 5 à 10 Mo pour un contenu parfaitement lisible à
 * moins de 500 Ko.
 */
export const IMAGE_COMPRESSION_THRESHOLD_BYTES = 800 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
  return `${Math.round(bytes / 1024)} Ko`;
}
