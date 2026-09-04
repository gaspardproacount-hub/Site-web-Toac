import "server-only";
import { google } from "googleapis";
import { Readable } from "node:stream";

/**
 * Dépôt des documents musculation (décharge signée + certificat médical)
 * dans un dossier Google Drive, via un compte de service Google Cloud.
 *
 * Configuration (voir .env.example / README) :
 *  - GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY :
 *    identifiants du compte de service (JSON téléchargé depuis Google Cloud
 *    Console → IAM & Admin → Comptes de service).
 *  - GOOGLE_DRIVE_MUSCULATION_FOLDER_ID : identifiant du dossier Drive
 *    (partagé en édition avec l'adresse du compte de service) où déposer
 *    les documents.
 */

export class GoogleDriveNotConfiguredError extends Error {
  constructor() {
    super(
      "L'intégration Google Drive n'est pas configurée. Renseignez GOOGLE_SERVICE_ACCOUNT_EMAIL, " +
        "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY et GOOGLE_DRIVE_MUSCULATION_FOLDER_ID (voir .env.example " +
        "et le README) pour activer le dépôt automatique des documents musculation."
    );
    this.name = "GoogleDriveNotConfiguredError";
  }
}

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new GoogleDriveNotConfiguredError();
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return google.drive({ version: "v3", auth });
}

export function getMusculationFolderId(): string {
  const folderId = process.env.GOOGLE_DRIVE_MUSCULATION_FOLDER_ID;
  if (!folderId) {
    throw new GoogleDriveNotConfiguredError();
  }
  return folderId;
}

/**
 * Dépose un fichier dans le dossier Drive musculation. Retourne le lien
 * Drive du fichier créé.
 */
export async function uploadFileToMusculationFolder(
  filename: string,
  mimeType: string,
  content: Buffer
): Promise<string> {
  const drive = getDriveClient();
  const folderId = getMusculationFolderId();

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(content),
    },
    fields: "id, webViewLink",
  });

  return response.data.webViewLink ?? `https://drive.google.com/file/d/${response.data.id}/view`;
}
