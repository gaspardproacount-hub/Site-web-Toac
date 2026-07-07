import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BUREAU_EMAIL = "toac-triathlon-bureau@googlegroups.com";

/**
 * Envoie les messages du formulaire de contact / préinscription via l'API
 * Resend si RESEND_API_KEY est configurée. Sinon, journalise le message
 * côté serveur (mode démo) — voir README pour configurer Resend.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { name, email, subject, message } = body ?? {};

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Nom, email et message sont requis." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.info("[contact] RESEND_API_KEY non configurée — message journalisé uniquement:", {
      name,
      email,
      subject,
      message,
    });
    return NextResponse.json({ ok: true, mode: "log" });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "TOAC Triathlon <site@toac-triathlon.com>",
      to: BUREAU_EMAIL,
      reply_to: email,
      subject: subject ? `[Site TOAC] ${subject}` : "[Site TOAC] Nouveau message",
      text: `De : ${name} <${email}>\n\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error("Erreur d'envoi Resend", await response.text());
    return NextResponse.json(
      { error: "Échec de l'envoi du message. Réessayez plus tard." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, mode: "email" });
}
