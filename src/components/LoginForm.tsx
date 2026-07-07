"use client";

import { useState, type FormEvent } from "react";

interface LoginFormProps {
  onSuccess: (info: { name: string; role: "member" | "admin" }) => void;
  compact?: boolean;
}

export default function LoginForm({ onSuccess, compact }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Connexion impossible.");
        return;
      }

      onSuccess({ name: data.name, role: data.role });
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-4" : "space-y-5"}>
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium text-toac-blue-900">
          Identifiant
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-md border border-toac-gray-200 px-3 py-2 text-toac-blue-950 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-toac-blue-900">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-toac-gray-200 px-3 py-2 text-toac-blue-950 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-toac-pink-500 px-4 py-2.5 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400 disabled:opacity-60"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-xs text-toac-blue-900/70">
        Identifiants transmis par le bureau du club. Compte de démonstration :{" "}
        <code className="rounded bg-toac-gray-100 px-1 py-0.5">demo</code> / voir README.
      </p>
    </form>
  );
}
