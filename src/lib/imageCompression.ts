"use client";

import { IMAGE_COMPRESSION_THRESHOLD_BYTES } from "@/lib/uploadLimits";

/**
 * Recompresse une photo avant son envoi, dans le navigateur.
 *
 * Un certificat médical photographié au smartphone pèse couramment 5 à 10 Mo,
 * alors que le corps d'une requête est plafonné à 4,5 Mo côté serveur. Sans
 * cette étape, l'adhérent n'a aucun moyen de s'en sortir seul : il devrait
 * redimensionner son image à la main. Redimensionnée à 2000 px et réencodée en
 * JPEG, la même photo tombe sous les 500 Ko sans devenir illisible.
 *
 * Les PDF ne sont pas touchés (rien à recompresser sans bibliothèque dédiée), et
 * si la compression n'améliore pas le fichier, l'original est conservé.
 */

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.82;

const COMPRESSIBLE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

function canCompress(file: File): boolean {
  return (
    COMPRESSIBLE_TYPES.has(file.type) &&
    file.size > IMAGE_COMPRESSION_THRESHOLD_BYTES &&
    typeof createImageBitmap === "function" &&
    typeof document !== "undefined"
  );
}

export async function compressImageFile(file: File): Promise<File> {
  if (!canCompress(file)) return file;

  try {
    // `imageOrientation: "from-image"` applique la rotation EXIF : sans elle,
    // une photo prise en portrait ressortirait couchée dans le PDF.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;
    // Les photos de documents n'ont pas de transparence : un fond blanc évite
    // qu'un PNG transparent ne devienne noir une fois converti en JPEG.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "document";
    return new File([blob], `${baseName}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch (error) {
    // Format exotique, image corrompue, canvas indisponible… : on renvoie le
    // fichier d'origine, la vérification de taille dira si l'envoi peut passer.
    console.warn("Compression de l'image impossible, fichier envoyé tel quel :", error);
    return file;
  }
}
