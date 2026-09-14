"use client";

/**
 * Lecture d'un fichier choisi dans un `<input type="file">`, en mémoire, avant
 * de l'envoyer.
 *
 * Un objet `File` issu d'un sélecteur n'est qu'une *référence* vers le fichier :
 * ses octets ne sont lus qu'au moment où le navigateur construit le corps de la
 * requête. Sur mobile, cette référence est fragile — un document ouvert depuis
 * un fournisseur (Drive, OneDrive, l'application Fichiers) peut voir sa
 * permission expirer, et la lecture échoue alors au dernier moment. Le `fetch`
 * est rejeté instantanément avec un `TypeError: Failed to fetch` indiscernable
 * d'une coupure réseau, et aucune trace ne parvient au serveur.
 *
 * En lisant le fichier ici, l'échec devient explicite et attribuable — et le
 * fichier renvoyé, détaché de sa source, ne peut plus disparaître en route.
 *
 * Les images passent déjà par cette matérialisation lors de leur recompression
 * (voir imageCompression.ts) ; c'est ce qui explique qu'un certificat en PDF
 * échouait là où une photo du même certificat passait.
 */

export class FileUnreadableError extends Error {
  constructor(public readonly fileName: string, cause: unknown) {
    super(`Le fichier « ${fileName} » n'a pas pu être lu.`, { cause });
    this.name = "FileUnreadableError";
  }
}

export async function materializeFile(file: File): Promise<File> {
  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch (error) {
    throw new FileUnreadableError(file.name, error);
  }

  // Un fichier vide après lecture trahit la même situation : la référence
  // existe encore, mais son contenu n'est plus accessible.
  if (buffer.byteLength === 0) {
    throw new FileUnreadableError(file.name, new Error("Fichier vide à la lecture"));
  }

  return new File([buffer], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  });
}
