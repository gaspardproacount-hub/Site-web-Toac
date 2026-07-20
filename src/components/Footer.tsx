import Link from "next/link";
import { FOOTER_SITEMAP } from "@/lib/nav";
import SiteLogo from "./SiteLogo";
import { CmsEditableText } from "./cms-edit";
import type { CmsPageBlock, CmsCatalogSection } from "@/lib/cms";

const PARTNERS = [
  "Foulées Toulouse",
  "Vertical Bike",
  "Cryo Sud",
  "Alltricks",
  "Trek",
];

const TAGLINE = "Nager, rouler, courir à Toulouse depuis 1992.";
const ADDRESS = "20 chemin de Garric\n31200 Toulouse";

export default function Footer({
  footerBlocks,
  partenairesSection,
}: {
  footerBlocks?: CmsPageBlock[] | null;
  partenairesSection?: CmsCatalogSection;
}) {
  const infoBlock = footerBlocks?.[0];
  const partnerNames = partenairesSection?.products.length
    ? partenairesSection.products.map((p) => ({ id: p.id, name: p.name }))
    : null;

  return (
    <footer className="bg-toac-blue-950 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-3 inline-block rounded-md bg-white/95 p-2">
            <SiteLogo className="h-10 w-auto" />
          </div>
          {infoBlock ? (
            <>
              <CmsEditableText
                as="p"
                value={infoBlock.heading || TAGLINE}
                target={{ kind: "block", id: infoBlock.id, field: "heading" }}
                className="block text-sm text-white/70"
              />
              <CmsEditableText
                as="p"
                value={infoBlock.body || ADDRESS}
                target={{ kind: "block", id: infoBlock.id, field: "body" }}
                multiline
                className="mt-4 block whitespace-pre-line text-sm text-white/70"
              />
            </>
          ) : (
            <>
              <p className="text-sm text-white/70">{TAGLINE}</p>
              <p className="mt-4 whitespace-pre-line text-sm text-white/70">{ADDRESS}</p>
            </>
          )}
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-toac-pink-400">
            Plan du site
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            {FOOTER_SITEMAP.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-toac-pink-400">
            Contact
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <a href="mailto:toac-triathlon-bureau@googlegroups.com" className="hover:text-white">
                toac-triathlon-bureau@googlegroups.com
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/triathlonsdulauragais"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Instagram @triathlonsdulauragais
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white"
              >
                Facebook Triathlons du Lauragais
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm uppercase tracking-wide text-toac-pink-400">
            Partenaires
          </h3>
          <ul className="space-y-2 text-sm text-white/80">
            {partnerNames
              ? partnerNames.map((p) => <li key={p.id}>{p.name}</li>)
              : PARTNERS.map((partner) => <li key={partner}>{partner}</li>)}
          </ul>
          <Link
            href="/le-club/partenaires"
            className="mt-3 inline-block text-sm font-medium text-toac-pink-400 hover:text-toac-pink-300"
          >
            Voir tous nos partenaires →
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/50 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} TOAC Triathlon — Association affiliée FFTRI, soutenue par le Toulouse Olympique
        Aérospatiale Club.
      </div>
    </footer>
  );
}
