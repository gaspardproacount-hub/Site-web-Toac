import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFImage } from "pdf-lib";

/**
 * Génère un PDF reprenant le contenu de la décharge "salle de musculation"
 * du TOAC Omnisports (voir le document Google Docs de référence), avec les
 * champs du formulaire et l'image de signature uploadée.
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

const MARGIN = 56;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;

export async function generateDechargePdf(
  data: DechargeData,
  signatureImageBytes: Buffer,
  signatureMimeType: string
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = PAGE_HEIGHT - MARGIN;
  const lineHeight = 16;
  const bodySize = 10.5;

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
  drawField("Toulouse, le", data.dateSignature);

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
    embeddedImage = await pdfDoc.embedPng(signatureImageBytes);
  } else {
    embeddedImage = await pdfDoc.embedJpg(signatureImageBytes);
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

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
