import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BUREAU_EMAIL = "toac-triathlon-bureau@googlegroups.com";

/**
 * Envoie les messages du formulaire de contact / préinscription via l'API
 * Brevo si BREVO_API_KEY est configurée. Sinon, journalise le message
 * côté serveur (mode démo) — voir README pour configurer Brevo.
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

  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.info("[contact] BREVO_API_KEY non configurée — message journalisé uniquement:", {
      name,
      email,
      subject,
      message,
    });
    return NextResponse.json({ ok: true, mode: "log" });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "Site TOAC Triathlon",
          email: process.env.BREVO_FROM_EMAIL ?? "site@toac-triathlon.com",
        },
        to: [{ email: BUREAU_EMAIL }],
        replyTo: { email, name },
        subject: subject ? `[Site TOAC] ${subject}` : "[Site TOAC] Nouveau message",
        textContent: `De : ${name} <${email}>\n\n${message}`,
      }),
    });

    if (!response.ok) {
      console.error("Erreur d'envoi Brevo", await response.text());
      return NextResponse.json(
        { error: "Échec de l'envoi du message. Réessayez plus tard." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, mode: "email" });
  } catch (err) {
    console.error("Erreur d'envoi Brevo", err);
    return NextResponse.json(
      { error: "Échec de l'envoi du message. Réessayez plus tard." },
      { status: 502 }
    );
  }
}
