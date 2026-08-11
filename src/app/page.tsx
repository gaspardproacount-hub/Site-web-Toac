import Link from "next/link";
import { Suspense } from "react";
import SiteImage from "@/components/SiteImage";
import InstagramFeed from "@/components/InstagramFeed";
import ActualitesSection from "@/components/ActualitesSection";
import { PARTENAIRES, PARTENAIRES_INSTITUTIONNELS } from "@/content/partenaires";
import { getCmsPageBlocks, getCmsCatalog } from "@/lib/cms";
import { CmsEditableText, CmsEditableImage, CmsPartnerName } from "@/components/cms-edit";
import { slugify } from "@/lib/slug";
import HorizontalScroller from "@/components/HorizontalScroller";

const STATS = [
  { value: "1992", label: "Année de fondation" },
  { value: "~180", label: "Licenciés (49 nouveaux en 2025)" },
  { value: "80 %", label: "Taux de renouvellement" },
  { value: "4", label: "Disciplines encadrées" },
];

const CARDS = [
  {
    title: "Entraînements",
    description: "Natation, vélo, course à pied et musculation, encadrés toute la semaine.",
    href: "/entrainements",
    image: "carte-entrainements",
  },
  {
    title: "Triathlons du Lauragais",
    description: "15e édition les 6 et 7 juin 2026 à Nailloux — notre grand événement annuel.",
    href: "/triathlons-du-lauragais",
    image: "carte-triathlons-lauragais",
  },
  {
    title: "Vie du club",
    description: "Stages, sorties, soirées, D3 : la convivialité au cœur du TOAC.",
    href: "/le-club/vie-du-club",
    image: "carte-vie-du-club",
  },
];

export default async function HomePage() {
  const [cmsBlocks, cmsCatalog] = await Promise.all([getCmsPageBlocks("accueil"), getCmsCatalog()]);
  const heroBlock = cmsBlocks?.[0];
  const heroTitle = heroBlock?.heading || "TOAC Triathlon";
  const heroSubtitle = heroBlock?.body || "Nager, rouler, courir à Toulouse depuis 1992";
  // bloc[1..3] = les 3 cartes "Le club en 3 temps" (le lien et la photo restent gérés dans le code).
  const cardBlocks = cmsBlocks?.slice(1, 1 + CARDS.length) ?? [];
  // bloc[4] = titre + légende du bloc Instagram.
  const instagramBlock = cmsBlocks?.[4];

  const statsSection = cmsCatalog?.find((s) => s.name === "Statistiques accueil");
  const partenairesSection = cmsCatalog?.find((s) => s.name === "Partenaires");
  const institutionnelsSection = cmsCatalog?.find((s) => s.name === "Partenaires institutionnels");

  return (
    <Suspense fallback={null}>
    <>
      <section className="relative flex min-h-[85vh] items-end overflow-hidden bg-toac-blue-950 text-white">
        <SiteImage
          name="hero-accueil"
          label="Photo hero — triathlète TOAC en action"
          priority
          className="absolute inset-0 h-full w-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-toac-blue-950 via-toac-blue-950/40 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
          <h1 className="animate-fade-in-up font-display text-4xl uppercase leading-tight sm:text-5xl lg:text-6xl">
            {heroBlock ? (
              <>
                <CmsEditableText
                  as="span"
                  value={heroTitle}
                  target={{ kind: "block", id: heroBlock.id, field: "heading" }}
                />
                <CmsEditableText
                  as="span"
                  value={heroSubtitle}
                  target={{ kind: "block", id: heroBlock.id, field: "body" }}
                  className="block text-toac-pink-500"
                />
              </>
            ) : (
              <>
                {heroTitle}
                <span className="block text-toac-pink-500">{heroSubtitle}</span>
              </>
            )}
          </h1>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/nous-rejoindre"
              className="rounded-md bg-toac-pink-500 px-6 py-3 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400"
            >
              Nous rejoindre
            </Link>
            <Link
              href="/le-club"
              className="rounded-md border-2 border-white px-6 py-3 font-display text-sm uppercase tracking-wide text-white transition hover:bg-white hover:text-toac-blue-950"
            >
              Découvrir le club
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-toac-gray-200 bg-toac-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {statsSection
            ? statsSection.products.map((stat) => (
                <div key={stat.id} className="text-center">
                  <CmsEditableText
                    as="div"
                    value={stat.name}
                    target={{ kind: "product", id: stat.id, field: "name" }}
                    className="font-display text-3xl text-toac-blue-950 sm:text-4xl"
                  />
                  <CmsEditableText
                    as="div"
                    value={stat.description}
                    target={{ kind: "product", id: stat.id, field: "description" }}
                    className="mt-1 text-sm text-toac-blue-900/70"
                  />
                </div>
              ))
            : STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display text-3xl text-toac-blue-950 sm:text-4xl">{stat.value}</div>
                  <div className="mt-1 text-sm text-toac-blue-900/70">{stat.label}</div>
                </div>
              ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950 sm:text-3xl">
          Le club en 3 temps
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, i) => {
            const block = cardBlocks[i];
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group overflow-hidden rounded-lg border border-toac-gray-200 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <SiteImage name={card.image} label={`Photo — ${card.title}`} className="h-48 w-full" />
                <div className="p-5">
                  {block ? (
                    <>
                      <CmsEditableText
                        as="h3"
                        value={block.heading || card.title}
                        target={{ kind: "block", id: block.id, field: "heading" }}
                        className="font-display text-lg uppercase text-toac-blue-950"
                      />
                      <CmsEditableText
                        as="p"
                        value={block.body || card.description}
                        target={{ kind: "block", id: block.id, field: "body" }}
                        multiline
                        className="mt-2 block text-sm text-toac-blue-900/70"
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="font-display text-lg uppercase text-toac-blue-950">{card.title}</h3>
                      <p className="mt-2 text-sm text-toac-blue-900/70">{card.description}</p>
                    </>
                  )}
                  <span className="mt-3 inline-block text-sm font-medium text-toac-blue-600 group-hover:underline">
                    En savoir plus →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <InstagramFeed block={instagramBlock} />

      <ActualitesSection catalog={cmsCatalog} />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="section-title text-center font-display text-2xl uppercase text-toac-blue-950 sm:text-3xl">
          Nos partenaires
        </h2>
        <div className="mt-8">
          <HorizontalScroller>
            {partenairesSection || institutionnelsSection
              ? [
                  ...(partenairesSection?.products ?? []),
                  ...(institutionnelsSection?.products ?? []),
                ].map((p) => (
                  <div
                    key={p.id}
                    className="flex w-40 shrink-0 snap-start flex-col items-center gap-3 rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm"
                  >
                    <CmsEditableImage
                      src={p.image_url}
                      alt={`Logo ${p.name}`}
                      target={{ kind: "product", id: p.id }}
                      className="flex h-16 w-full items-center justify-center"
                      imgClassName="max-h-16 w-full object-contain"
                    />
                    <CmsPartnerName
                      as="span"
                      value={p.name}
                      url={p.url}
                      target={{ kind: "product", id: p.id, field: "name" }}
                      className="text-center font-display text-sm uppercase text-toac-blue-900/70 hover:text-toac-blue-950"
                    />
                  </div>
                ))
              : [...PARTENAIRES, ...PARTENAIRES_INSTITUTIONNELS.map((name) => ({ name }))].map((p) => (
                  <div
                    key={p.name}
                    className="flex w-40 shrink-0 snap-start flex-col items-center gap-3 rounded-lg border border-toac-gray-200 bg-white p-5 shadow-sm"
                  >
                    <SiteImage
                      name={`partenaire-${slugify(p.name)}`}
                      label={`Logo ${p.name}`}
                      className="h-16 w-full"
                    />
                    <span className="text-center font-display text-sm uppercase text-toac-blue-900/70">
                      {p.name}
                    </span>
                  </div>
                ))}
          </HorizontalScroller>
        </div>
      </section>
    </>
    </Suspense>
  );
}
