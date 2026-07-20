"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { NAV_ITEMS, type NavLink } from "@/lib/nav";
import { useAuth } from "./AuthProvider";
import SiteLogo from "./SiteLogo";
import { CmsEditableText } from "./cms-edit";
import type { CmsPageBlock } from "@/lib/cms";

// Aplatit NAV_ITEMS (parents puis enfants, dans l'ordre d'affichage) pour faire
// correspondre chaque libellé au bloc CMS de même position — seul le texte du
// libellé est modifiable, le lien (href) reste toujours géré dans le code.
function flattenLabelKeys(): string[] {
  const keys: string[] = [];
  for (const item of NAV_ITEMS) {
    keys.push(item.label);
    for (const child of item.children ?? []) {
      keys.push(`${item.label}>${child.label}`);
    }
  }
  return keys;
}

export default function Navbar({ navBlocks }: { navBlocks?: CmsPageBlock[] | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { auth, requireAuth, logout } = useAuth();

  const overrides = useMemo(() => {
    const keys = flattenLabelKeys();
    const map = new Map<string, CmsPageBlock>();
    keys.forEach((key, i) => {
      const block = navBlocks?.[i];
      if (block) map.set(key, block);
    });
    return map;
  }, [navBlocks]);

  function NavLabel({ text, mapKey }: { text: string; mapKey: string }) {
    const block = overrides.get(mapKey);
    if (!block) return <>{text}</>;
    return (
      <CmsEditableText
        as="span"
        value={block.heading || text}
        target={{ kind: "block", id: block.id, field: "heading" }}
      />
    );
  }

  function handleLinkClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    link: NavLink
  ) {
    if (link.protected && !auth.loggedIn) {
      event.preventDefault();
      requireAuth(link.href);
    }
    setMobileOpen(false);
    setOpenDropdown(null);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-toac-gray-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Navigation principale">
        <Link href="/" className="flex items-center">
          <SiteLogo className="h-10 w-auto" />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => item.children && setOpenDropdown(null)}
            >
              {item.children ? (
                <button
                  type="button"
                  aria-expanded={openDropdown === item.label}
                  aria-haspopup="true"
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.label ? null : item.label)
                  }
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-toac-blue-950 hover:text-toac-blue-600"
                >
                  <NavLabel text={item.label} mapKey={item.label} />
                  <svg
                    aria-hidden="true"
                    className={`h-3 w-3 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
                  </svg>
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className="px-3 py-2 text-sm font-medium text-toac-blue-950 hover:text-toac-blue-600"
                >
                  <NavLabel text={item.label} mapKey={item.label} />
                </Link>
              )}

              {item.children && openDropdown === item.label && (
                <div className="absolute left-0 top-full w-64 rounded-md border border-toac-gray-200 bg-white py-2 shadow-lg">
                  {item.children.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-toac-blue-950 hover:bg-toac-pink-300/30"
                    >
                      {link.protected && <span aria-hidden="true">🔒</span>}
                      <NavLabel text={link.label} mapKey={`${item.label}>${link.label}`} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {auth.loggedIn ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-toac-blue-950">Bonjour {auth.name}</span>
              <button
                type="button"
                onClick={() => logout()}
                className="font-medium text-toac-blue-700 hover:text-toac-blue-950"
              >
                Se déconnecter
              </button>
            </div>
          ) : null}
          <Link
            href="/nous-rejoindre"
            className="rounded-md bg-toac-pink-500 px-4 py-2 font-display text-sm uppercase tracking-wide text-white transition hover:bg-toac-pink-400"
          >
            Nous rejoindre
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <div className="flex h-6 w-7 flex-col justify-between">
            <span className={`h-0.5 w-full bg-toac-blue-950 transition ${mobileOpen ? "translate-y-2.5 rotate-45" : ""}`} />
            <span className={`h-0.5 w-full bg-toac-blue-950 transition ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-full bg-toac-blue-950 transition ${mobileOpen ? "-translate-y-2.5 -rotate-45" : ""}`} />
          </div>
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-toac-gray-200 bg-white lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href ?? item.children![0].href}
                  onClick={() => {
                    if (!item.children) setMobileOpen(false);
                  }}
                  className="block py-2 font-medium text-toac-blue-950"
                >
                  <NavLabel text={item.label} mapKey={item.label} />
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-1 border-l border-toac-gray-200 pl-4">
                    {item.children.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link)}
                        className="flex items-center gap-2 py-1.5 text-sm text-toac-blue-900"
                      >
                        {link.protected && <span aria-hidden="true">🔒</span>}
                        <NavLabel text={link.label} mapKey={`${item.label}>${link.label}`} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3">
              {auth.loggedIn ? (
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full rounded-md border border-toac-blue-800 px-4 py-2 text-sm font-medium text-toac-blue-950"
                >
                  Se déconnecter ({auth.name})
                </button>
              ) : null}
              <Link
                href="/nous-rejoindre"
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-md bg-toac-pink-500 px-4 py-2.5 text-center font-display text-sm uppercase tracking-wide text-white"
              >
                Nous rejoindre
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
