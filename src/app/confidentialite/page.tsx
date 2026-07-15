import type { Metadata } from "next";
import { Suspense } from "react";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

export default function ConfidentialitePage() {
  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Politique de confidentialité
      </h1>

      <CmsPageBlocks
        slug="confidentialite"
        fallback={
          <div className="mt-8 space-y-6 text-sm text-toac-blue-900/90">
            <section>
              <h2 className="font-display text-base uppercase text-toac-blue-950">Données collectées</h2>
              <p className="mt-2">
                Le TOAC Triathlon collecte les données nécessaires à la gestion de l'adhésion (identité, contact,
                statut de licence FFTRI) et au suivi des dossiers adhérents (paiement, formulaire, caution, licence).
                Ces données sont saisies via le formulaire d'adhésion et gérées par le bureau du club.
              </p>
            </section>
            <section>
              <h2 className="font-display text-base uppercase text-toac-blue-950">Espace adhérents</h2>
              <p className="mt-2">
                L'espace adhérents est protégé par une authentification côté serveur (identifiant et mot de passe
                transmis par le bureau). Les données personnelles des adhérents ne sont jamais exposées dans le
                code du site accessible publiquement : elles sont stockées côté serveur et servies uniquement après
                vérification de la session.
              </p>
            </section>
            <section>
              <h2 className="font-display text-base uppercase text-toac-blue-950">Partage avec les partenaires</h2>
              <p className="mt-2">
                Certains avantages partenaires (ex. Alltricks) nécessitent la transmission de votre email au
                partenaire concerné ; cette transmission ne se fait qu'avec votre consentement explicite.
              </p>
            </section>
            <section>
              <h2 className="font-display text-base uppercase text-toac-blue-950">Vos droits</h2>
              <p className="mt-2">
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos
                données. Pour l'exercer, contactez le bureau à toac-triathlon-bureau@googlegroups.com.
              </p>
            </section>
          </div>
        }
      />
    </div>
    </Suspense>
  );
}
