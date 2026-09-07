const inputClass =
  "w-full rounded-md border border-toac-gray-200 px-3 py-2 outline-none focus:border-toac-blue-600 focus:ring-2 focus:ring-toac-blue-600/30";
const labelClass = "mb-1 block text-sm font-medium text-toac-blue-900";

/**
 * "Comment bénéficier des avantages" — formulaire fixe (pas de bloc CMS,
 * contrairement au reste de la page) : il doit vraiment enregistrer la
 * demande, un simple texte éditable n'y suffirait pas. Après envoi, le
 * serveur redirige vers cette même page avec ?merci=1, qui bascule sur le
 * message de confirmation.
 */
export default function AlltricksSignupForm({ showConfirmation }: { showConfirmation: boolean }) {
  return (
    <section className="rounded-lg border border-toac-gray-200 bg-toac-gray-50 p-6">
      <h2 className="section-title font-display text-xl uppercase text-toac-blue-950">
        Comment bénéficier des avantages
      </h2>

      {showConfirmation ? (
        <p className="mt-4 rounded-md bg-toac-pink-300/20 border border-toac-pink-500/30 p-4 text-sm text-toac-blue-900">
          Merci ! Alain, responsable partenariat, va contrôler que tu es bien adhérent puis va renseigner
          ton adresse email sur notre compte Alltricks. Il te l&apos;indiquera quand ce sera fait.
        </p>
      ) : (
        <div className="mt-4 space-y-6">
          <div>
            <span className="font-display text-sm uppercase tracking-wide text-toac-blue-600">Étape 1</span>
            <p className="mt-1 text-toac-blue-900/90">
              Je crée mon compte client sur{" "}
              <a
                href="https://www.alltricks.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-toac-blue-700 underline"
              >
                alltricks.fr
              </a>
              .
            </p>
          </div>

          <div>
            <span className="font-display text-sm uppercase tracking-wide text-toac-blue-600">Étape 2</span>
            <p className="mt-1 text-toac-blue-900/90">Je renseigne le formulaire ci-dessous.</p>

            <form action="/api/partenaires/inscription" method="POST" className="mt-4 space-y-4">
              <input type="hidden" name="partenaire" value="alltricks" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="alltricks-nom" className={labelClass}>Nom</label>
                  <input id="alltricks-nom" name="nom" required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="alltricks-prenom" className={labelClass}>Prénom</label>
                  <input id="alltricks-prenom" name="prenom" required className={inputClass} />
                </div>
              </div>

              <div>
                <label htmlFor="alltricks-email" className={labelClass}>Email</label>
                <input id="alltricks-email" name="email" type="email" required className={inputClass} />
                <p className="mt-1 text-xs text-toac-blue-900/60">
                  Renseigne l&apos;adresse email avec laquelle tu as créé ton compte Alltricks.
                </p>
              </div>

              <label className="flex items-start gap-2 text-sm text-toac-blue-900">
                <input type="checkbox" name="consentement" required className="mt-1" />
                J&apos;accepte que le TOAC Triathlon associe mon adresse email au compte Alltricks du club.
              </label>

              <button
                type="submit"
                className="rounded-md bg-toac-pink-500 px-6 py-2.5 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400"
              >
                Valider
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
