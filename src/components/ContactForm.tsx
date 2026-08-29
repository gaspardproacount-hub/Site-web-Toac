"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formLoadedAt] = useState(() => Date.now());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message"),
      // Anti-spam : champ piège invisible + délai de remplissage (voir route API).
      website: form.get("website"),
      startedAt: formLoadedAt,
    };

    let response: Response;
    try {
      response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      setErrorMessage("Erreur réseau. Réessayez plus tard.");
      setStatus("error");
      return;
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setErrorMessage(data?.error ?? "Une erreur est survenue. Réessayez plus tard.");
      setStatus("error");
      return;
    }
    setStatus("sent");
    event.currentTarget.reset();
  }

  if (status === "sent") {
    return (
      <p className="rounded-md border border-green-300 bg-green-50 p-4 text-green-800">
        Merci, votre message a bien été envoyé au bureau du club.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-toac-blue-900">Nom</label>
          <input id="name" name="name" required className="w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30" />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-toac-blue-900">Email</label>
          <input id="email" name="email" type="email" required className="w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30" />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-toac-blue-900">Sujet</label>
        <input id="subject" name="subject" className="w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30" />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-toac-blue-900">Message</label>
        <textarea id="message" name="message" rows={5} required className="w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30" />
      </div>

      {/* Champ piège anti-bot : masqué visuellement et aux lecteurs d'écran, un vrai visiteur ne le remplit jamais. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor="website">Laissez ce champ vide</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {errorMessage && <p role="alert" className="text-sm font-medium text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-toac-pink-500 px-6 py-2.5 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400 disabled:opacity-60"
      >
        {status === "sending" ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
