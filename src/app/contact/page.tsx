import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";
import LieuxMap from "@/components/LieuxMap";
import { CmsPageBlocks } from "@/components/CmsPageBlocks";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez le TOAC Triathlon : bureau, adresse du club, réseaux sociaux.",
};

const TOAC_LIEU = {
  id: "toac-siege",
  nom: "TOAC Triathlon",
  adresse: "20 chemin de Garric, 31200 Toulouse",
  lat: 43.5804,
  lng: 1.4372,
  disciplines: [],
  creneaux: "",
};

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">Contact</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <ContactForm />
        </div>
        <div className="space-y-6">
          <div className="relative rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm text-sm">
            <CmsPageBlocks
              slug="contact"
              fallback={
                <>
                  <p className="font-medium text-toac-blue-950">Adresse du club</p>
                  <p className="text-toac-blue-900/80">20 chemin de Garric, 31200 Toulouse</p>
                  <p className="mt-3 font-medium text-toac-blue-950">Email du bureau</p>
                  <a href="mailto:toac-triathlon-bureau@googlegroups.com" className="text-toac-blue-600 underline">
                    toac-triathlon-bureau@googlegroups.com
                  </a>
                  <p className="mt-3 font-medium text-toac-blue-950">Réseaux sociaux</p>
                  <ul className="space-y-1">
                    <li>
                      <a href="https://www.instagram.com/triathlonsdulauragais" target="_blank" rel="noopener noreferrer" className="text-toac-blue-600 underline">
                        Instagram — Club & @triathlonsdulauragais
                      </a>
                    </li>
                    <li>
                      <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-toac-blue-600 underline">
                        Facebook — Triathlons du Lauragais
                      </a>
                    </li>
                  </ul>
                </>
              }
            />
          </div>
          <LieuxMap lieux={[TOAC_LIEU]} />
        </div>
      </div>
    </div>
    </Suspense>
  );
}
