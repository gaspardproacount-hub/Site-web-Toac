import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { BLOB_TOKEN_ENV_NAMES, resolveBlobToken, putBlob } from "@/lib/blob";

export const metadata: Metadata = {
  title: "Vue bureau — Diagnostic serveur",
  robots: { index: false, follow: false },
};

// Les variables d'environnement doivent être lues à CHAQUE requête, jamais
// figées au build : sans cela la page afficherait l'état de la machine de
// build de Vercel et non celui de la fonction qui sert le site.
export const dynamic = "force-dynamic";

/** Variables attendues côté serveur, avec leur rôle. */
const WATCHED_VARS: { name: string; role: string }[] = [
  { name: "BLOB_READ_WRITE_TOKEN", role: "Stockage des documents (Vercel Blob)" },
  { name: "TOAC_BLOB_TOKEN", role: "Repli du jeton Vercel Blob (nom non géré par Vercel)" },
  { name: "DATABASE_URL", role: "Base Postgres (dossiers, commandes, décharges)" },
  { name: "SESSION_SECRET", role: "Signature des cookies de l'espace adhérents" },
  { name: "BREVO_API_KEY", role: "Envoi des emails du formulaire de contact" },
  { name: "MONETICO_CLE_HMAC", role: "Paiement en ligne Monetico" },
];

/** Préfixes de noms de variables intéressants pour le diagnostic stockage/DB. */
const NAME_FILTER = /BLOB|STORE|POSTGRES|DATABASE|VERCEL|NETLIFY/i;

function describeValue(name: string): { present: boolean; length: number; hint: string } {
  const raw = process.env[name];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return { present: false, length: 0, hint: "—" };

  // On ne montre jamais la valeur : seulement de quoi vérifier qu'elle a la
  // bonne forme. Pour un jeton Blob (vercel_blob_rw_<storeId>_<secret>),
  // l'identifiant de store n'est pas secret (il apparaît dans les URLs
  // publiques des fichiers), la partie aléatoire l'est.
  const blobMatch = value.match(/^(vercel_blob_rw_[A-Za-z0-9]+)_/);
  if (blobMatch) return { present: true, length: value.length, hint: `${blobMatch[1]}_***` };

  return { present: true, length: value.length, hint: `${value.slice(0, 3)}***` };
}

type BlobTest =
  | { ok: true; url: string; source: string }
  | { ok: false; errorName: string; errorMessage: string };

async function runBlobTest(): Promise<BlobTest> {
  const resolved = resolveBlobToken();
  try {
    const blob = await putBlob(
      `diagnostic/test-${Date.now()}.txt`,
      `Test de diagnostic TOAC — ${new Date().toISOString()}`,
      { contentType: "text/plain; charset=utf-8" }
    );
    return { ok: true, url: blob.url, source: resolved?.source ?? "?" };
  } catch (error) {
    return {
      ok: false,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }
}

export default async function BureauDiagnosticPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion?next=/espace-adherents/bureau/diagnostic");
  if (session.role !== "admin") redirect("/espace-adherents/dossier");

  const { test } = await searchParams;
  const blobTest = test === "blob" ? await runBlobTest() : null;

  const onVercel = Boolean(process.env.VERCEL);
  const onNetlify = Boolean(process.env.NETLIFY);
  const platform = onVercel ? "Vercel" : onNetlify ? "Netlify" : "Inconnue (ni Vercel, ni Netlify)";

  const hosting: { label: string; value: string }[] = [
    { label: "Plateforme détectée", value: platform },
    { label: "Environnement (VERCEL_ENV)", value: process.env.VERCEL_ENV ?? "—" },
    { label: "Région (VERCEL_REGION)", value: process.env.VERCEL_REGION ?? "—" },
    { label: "URL du déploiement (VERCEL_URL)", value: process.env.VERCEL_URL ?? "—" },
    { label: "Branche déployée", value: process.env.VERCEL_GIT_COMMIT_REF ?? "—" },
    { label: "Commit déployé", value: (process.env.VERCEL_GIT_COMMIT_SHA ?? "—").slice(0, 12) },
    { label: "Node.js", value: process.version },
  ];

  const matchingNames = Object.keys(process.env).filter((name) => NAME_FILTER.test(name)).sort();
  const blobToken = resolveBlobToken();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Vue bureau — Diagnostic serveur
      </h1>
      <p className="mt-4 text-toac-blue-900/80">
        État réel des variables d&apos;environnement <strong>vues par la fonction qui sert le site</strong>
        {" "}(et non par le dashboard de l&apos;hébergeur). Aucune valeur secrète n&apos;est affichée, seulement
        sa présence, sa longueur et son préfixe.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl uppercase text-toac-blue-950">Hébergement</h2>
        <dl className="mt-4 divide-y divide-toac-blue-900/10 rounded-md border border-toac-blue-900/15">
          {hosting.map((row) => (
            <div key={row.label} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
              <dt className="text-toac-blue-900/70">{row.label}</dt>
              <dd className="font-mono text-toac-blue-950">{row.value}</dd>
            </div>
          ))}
        </dl>
        {!onVercel && !onNetlify ? (
          <p className="mt-3 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Aucun marqueur d&apos;hébergeur détecté : le site ne tourne pas sur Vercel. Les variables
            configurées dans le dashboard Vercel ne seront jamais injectées ici.
          </p>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl uppercase text-toac-blue-950">Variables attendues</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-toac-blue-900/20 text-left text-toac-blue-900/70">
                <th className="py-2 pr-4 font-medium">Variable</th>
                <th className="py-2 pr-4 font-medium">État</th>
                <th className="py-2 pr-4 font-medium">Longueur</th>
                <th className="py-2 font-medium">Aperçu</th>
              </tr>
            </thead>
            <tbody>
              {WATCHED_VARS.map(({ name, role }) => {
                const info = describeValue(name);
                return (
                  <tr key={name} className="border-b border-toac-blue-900/10 align-top">
                    <td className="py-2 pr-4">
                      <span className="font-mono text-toac-blue-950">{name}</span>
                      <span className="block text-xs text-toac-blue-900/60">{role}</span>
                    </td>
                    <td className="py-2 pr-4">
                      {info.present ? (
                        <span className="text-emerald-700">présente</span>
                      ) : (
                        <span className="text-red-700">absente</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 font-mono">{info.present ? info.length : "—"}</td>
                    <td className="py-2 font-mono break-all">{info.hint}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl uppercase text-toac-blue-950">
          Test d&apos;écriture Vercel Blob
        </h2>
        <p className="mt-3 text-sm text-toac-blue-900/80">
          {blobToken
            ? `Jeton trouvé via ${blobToken.source}. Le test envoie un petit fichier texte dans le store.`
            : `Aucun jeton trouvé (ni ${BLOB_TOKEN_ENV_NAMES.join(", ni ")}). Le test échouera tant qu'une de ces variables n'est pas injectée au runtime.`}
        </p>
        <p className="mt-4">
          <Link
            href="/espace-adherents/bureau/diagnostic?test=blob"
            className="inline-block rounded-md border border-toac-blue-800 px-4 py-2 text-sm font-medium text-toac-blue-950 hover:bg-toac-blue-950 hover:text-white"
          >
            Lancer le test d&apos;écriture →
          </Link>
        </p>
        {blobTest ? (
          blobTest.ok ? (
            <div className="mt-4 rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <p>Écriture réussie via {blobTest.source}. Fichier créé :</p>
              <p className="mt-1 font-mono break-all">{blobTest.url}</p>
            </div>
          ) : (
            <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-900">
              <p className="font-medium">Échec — erreur brute renvoyée par le serveur :</p>
              <p className="mt-1 font-mono break-words">
                {blobTest.errorName}: {blobTest.errorMessage}
              </p>
            </div>
          )
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl uppercase text-toac-blue-950">
          Noms de variables injectées ({matchingNames.length})
        </h2>
        <p className="mt-3 text-sm text-toac-blue-900/80">
          Noms uniquement (aucune valeur), filtrés sur stockage / base de données / hébergeur. Si
          <span className="font-mono"> BLOB_READ_WRITE_TOKEN </span>
          n&apos;apparaît pas ici alors qu&apos;il est visible dans le dashboard, c&apos;est que le déploiement
          servi ne vient pas de ce projet/environnement.
        </p>
        {matchingNames.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {matchingNames.map((name) => (
              <li
                key={name}
                className="rounded-md bg-toac-blue-950/5 px-2 py-1 font-mono text-xs text-toac-blue-950"
              >
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-red-700">Aucune. Le runtime ne reçoit aucune de ces variables.</p>
        )}
      </section>

      <p className="mt-12">
        <Link href="/espace-adherents/bureau" className="text-sm text-toac-blue-800 underline">
          ← Retour à la vue bureau
        </Link>
      </p>
    </div>
  );
}
