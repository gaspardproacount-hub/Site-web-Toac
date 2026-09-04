import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFImage } from "pdf-lib";

/**
 * Génère le dossier "salle de musculation" en un seul PDF : la décharge du
 * TOAC Omnisports remplie avec les champs du formulaire et la signature
 * uploadée (page 1), suivie du certificat médical transmis (pages suivantes).
 * C'est ce document unique qui est relu par l'adhérent, envoyé au bureau et
 * archivé.
 */
export interface DechargeData {
  nom: string;
  prenom: string;
  nationalite: string;
  dateNaissance: string;
  adresse: string;
  codePostal: string;
  ville: string;
  dateSignature: string;
  mineur?: {
    representantNom: string;
    dateSignature: string;
  };
}

export interface CertificatFile {
  bytes: Buffer;
  mimeType: string;
}

const MARGIN = 56;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;

/**
 * Bandeau logos (TOAC Omnisports + CSE Airbus Operations Toulouse) placé en
 * en-tête de la décharge. Le fichier doit être listé dans
 * `outputFileTracingIncludes` (next.config.ts) pour être embarqué dans la
 * fonction déployée. S'il manque, le PDF est produit sans en-tête plutôt que
 * de faire échouer l'envoi du dossier.
 */
const HEADER_IMAGE_PATH = path.join(process.cwd(), "public", "images", "decharge-entete.png");
const HEADER_MAX_HEIGHT = 64;

/**
 * pdf-lib lit `.buffer` de la donnée qu'on lui passe sans tenir compte du
 * `byteOffset`. Or un `Buffer` Node issu du pool mémoire (ce que renvoie
 * `readFile` pour les petits fichiers) est une vue décalée dans un tampon
 * partagé : pdf-lib lirait alors des octets qui ne sont pas les nôtres et
 * rejetterait l'image (« SOI not found in JPEG »). On recopie donc dans un
 * tampon qui nous appartient, avec un offset nul.
 */
function ownBytes(input: Buffer | Uint8Array): Uint8Array {
  return new Uint8Array(input);
}

async function embedHeader(pdfDoc: PDFDocument): Promise<PDFImage | null> {
  try {
    const bytes = await readFile(HEADER_IMAGE_PATH);
    return await pdfDoc.embedPng(ownBytes(bytes));
  } catch (error) {
    console.warn(
      `En-tête de décharge introuvable ou illisible (${HEADER_IMAGE_PATH}) — PDF généré sans logos.`,
      error
    );
    return null;
  }
}

/** Ajoute le certificat médical au PDF : ses pages s'il est en PDF, une page dédiée si c'est une image. */
async function appendCertificat(pdfDoc: PDFDocument, certificat: CertificatFile): Promise<void> {
  if (certificat.mimeType === "application/pdf") {
    const source = await PDFDocument.load(ownBytes(certificat.bytes));
    const pages = await pdfDoc.copyPages(source, source.getPageIndices());
    for (const page of pages) pdfDoc.addPage(page);
    return;
  }

  const image =
    certificat.mimeType === "image/png"
      ? await pdfDoc.embedPng(ownBytes(certificat.bytes))
      : await pdfDoc.embedJpg(ownBytes(certificat.bytes));

  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;
  const maxHeight = PAGE_HEIGHT - MARGIN * 2;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = image.width * scale;
  const height = image.height * scale;

  page.drawImage(image, {
    x: (PAGE_WIDTH - width) / 2,
    y: (PAGE_HEIGHT - height) / 2,
    width,
    height,
  });
}

export async function generateDechargePdf(
  data: DechargeData,
  signatureImageBytes: Buffer,
  signatureMimeType: string,
  certificat?: CertificatFile
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;
  const lineHeight = 16;
  const bodySize = 10.5;

  const header = await embedHeader(pdfDoc);
  if (header) {
    const maxWidth = PAGE_WIDTH - MARGIN * 2;
    const scale = Math.min(maxWidth / header.width, HEADER_MAX_HEIGHT / header.height);
    const width = header.width * scale;
    const height = header.height * scale;
    page.drawImage(header, { x: (PAGE_WIDTH - width) / 2, y: y - height, width, height });
    y -= height + lineHeight * 1.5;
  }

  function drawTitle(text: string) {
    page.drawText(text, { x: MARGIN, y, size: 15, font: boldFont, color: rgb(0.05, 0.1, 0.25) });
    y -= lineHeight * 2;
  }

  function drawField(label: string, value: string) {
    page.drawText(`${label} : ${value}`, { x: MARGIN, y, size: bodySize, font });
    y -= lineHeight;
  }

  function drawParagraph(text: string) {
    const maxWidth = PAGE_WIDTH - MARGIN * 2;
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, bodySize) > maxWidth) {
        page.drawText(line, { x: MARGIN, y, size: bodySize, font });
        y -= lineHeight;
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) {
      page.drawText(line, { x: MARGIN, y, size: bodySize, font });
      y -= lineHeight;
    }
    y -= lineHeight * 0.5;
  }

  drawTitle("DÉCHARGE SALLE DE MUSCULATION — TOAC OMNISPORTS");

  drawField("NOM", data.nom);
  drawField("PRÉNOM", data.prenom);
  drawField("NATIONALITÉ", data.nationalite);
  drawField("DATE DE NAISSANCE", data.dateNaissance);
  drawField("ADRESSE", data.adresse);
  drawField("CODE POSTAL", data.codePostal);
  drawField("VILLE", data.ville);
  y -= lineHeight * 0.5;

  drawParagraph(
    `Je soussigné(e) ${data.prenom} ${data.nom}, déclare être conscient(e) que la pratique des ` +
      "exercices physiques et l'emploi des appareils de la salle de musculation et de charges " +
      "additionnelles peuvent occasionner des lésions corporelles."
  );
  drawParagraph(
    "J'ai pris note que le TOAC OMNISPORTS me demande de me soumettre, au préalable, à un examen " +
      "médical complet (valable 3 ans) afin de m'assurer de mon aptitude à la pratique de la " +
      "musculation avant de pratiquer de tels exercices."
  );
  drawParagraph(
    "Je m'engage à utiliser l'équipement de la salle de musculation de manière raisonnable, en " +
      "fonction de mes capacités physiques et en présence de mon éducateur."
  );
  drawParagraph(
    "Par la présente, je décharge le TOAC OMNISPORTS et ses responsables de quelque responsabilité " +
      "que ce soit pour toute atteinte à ma santé consécutive à l'utilisation des agrès mis à " +
      "disposition dans la salle de musculation."
  );

  y -= lineHeight * 0.5;
  // Lieu et date de signature : la ville renseignée dans le formulaire, et la
  // date du jour de l'envoi (calculée par l'API, plus saisie à la main).
  drawField(`${data.ville}, le`, data.dateSignature);

  if (data.mineur) {
    y -= lineHeight;
    drawParagraph(
      `Autorisation parentale : je soussigné(e) ${data.mineur.representantNom}, père/mère/répondant ` +
        `légal de ${data.prenom} ${data.nom}, ai pris connaissance du présent document et l'autorise ` +
        "à fréquenter ces installations, sous mon entière responsabilité."
    );
    drawField("Date et signature du représentant légal", data.mineur.dateSignature);
  }

  y -= lineHeight * 0.5;
  page.drawText("Signature :", { x: MARGIN, y, size: bodySize, font: boldFont });

  const signatureBoxTop = y - 8;
  const signatureBoxHeight = 90;
  const signatureBoxWidth = 220;

  let embeddedImage: PDFImage;
  if (signatureMimeType === "image/png") {
    embeddedImage = await pdfDoc.embedPng(ownBytes(signatureImageBytes));
  } else {
    embeddedImage = await pdfDoc.embedJpg(ownBytes(signatureImageBytes));
  }

  const scale = Math.min(
    signatureBoxWidth / embeddedImage.width,
    signatureBoxHeight / embeddedImage.height,
    1
  );
  const drawWidth = embeddedImage.width * scale;
  const drawHeight = embeddedImage.height * scale;

  page.drawImage(embeddedImage, {
    x: MARGIN + 90,
    y: signatureBoxTop - drawHeight,
    width: drawWidth,
    height: drawHeight,
  });

  if (certificat) {
    await appendCertificat(pdfDoc, certificat);
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
