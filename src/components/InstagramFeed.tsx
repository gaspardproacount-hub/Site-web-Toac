"use client";

import { useEffect } from "react";
import SiteImage from "./SiteImage";
import RawEmbed from "./RawEmbed";
import { INSTAGRAM } from "@/content/instagram";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.5.01-4.74.07-.9.04-1.38.19-1.7.32-.43.16-.74.36-1.06.68-.32.32-.52.63-.68 1.06-.13.32-.28.8-.32 1.7C3.21 8.5 3.2 8.85 3.2 12s.01 3.5.07 4.74c.04.9.19 1.38.32 1.7.16.43.36.74.68 1.06.32.32.63.52 1.06.68.32.13.8.28 1.7.32 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.9-.04 1.38-.19 1.7-.32.43-.16.74-.36 1.06-.68.32-.32.52-.63.68-1.06.13-.32.28-.8.32-1.7.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.9-.19-1.38-.32-1.7a2.85 2.85 0 0 0-.68-1.06 2.85 2.85 0 0 0-1.06-.68c-.32-.13-.8-.28-1.7-.32C15.5 4.01 15.15 4 12 4Zm0 3.06A4.94 4.94 0 1 1 12 17a4.94 4.94 0 0 1 0-9.88Zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28Zm5.14-.62a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z" />
    </svg>
  );
}

export default function InstagramFeed() {
  const hasWidgetHtml = INSTAGRAM.widgetEmbedHtml.trim().length > 0;
  const hasWidgetIframe = INSTAGRAM.widgetIframeSrc.trim().length > 0;
  const hasPosts = INSTAGRAM.posts.length > 0;
  const usePostEmbeds = !hasWidgetHtml && !hasWidgetIframe && hasPosts;

  useEffect(() => {
    if (!usePostEmbeds) return;
    if (!document.getElementById("instagram-embed-script")) {
      const script = document.createElement("script");
      script.id = "instagram-embed-script";
      script.async = true;
      script.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(script);
    }
    const timer = setTimeout(() => {
      window.instgrm?.Embeds?.process();
    }, 500);
    return () => clearTimeout(timer);
  }, [usePostEmbeds]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="section-title font-display text-2xl uppercase text-toac-blue-950 sm:text-3xl">
          Suivez-nous sur Instagram
        </h2>
        <a
          href={INSTAGRAM.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-toac-pink-500 to-toac-pink-600 px-5 py-2.5 font-display text-sm uppercase tracking-wide text-white transition hover:opacity-90"
        >
          <InstagramIcon className="h-5 w-5" />
          @{INSTAGRAM.handle}
        </a>
      </div>

      <div className="mt-8">
        {hasWidgetHtml ? (
          <RawEmbed html={INSTAGRAM.widgetEmbedHtml} />
        ) : hasWidgetIframe ? (
          <iframe
            src={INSTAGRAM.widgetIframeSrc}
            title="Fil Instagram du TOAC Triathlon"
            className="h-[560px] w-full rounded-lg border border-toac-gray-200"
            style={{ border: "none", overflow: "hidden" }}
            scrolling="no"
          />
        ) : usePostEmbeds ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INSTAGRAM.posts.map((url) => (
              <blockquote
                key={url}
                className="instagram-media"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{ margin: 0, width: "100%", minWidth: 0 }}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {INSTAGRAM.fallbackTiles.map((tile, i) => (
              <a
                key={tile}
                href={INSTAGRAM.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-lg border border-toac-gray-200 shadow-sm"
              >
                <SiteImage
                  name={tile}
                  label={`Post Instagram ${i + 1}`}
                  className="h-full w-full transition group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-toac-blue-950/0 transition group-hover:bg-toac-blue-950/30">
                  <InstagramIcon className="h-8 w-8 text-white opacity-0 transition group-hover:opacity-100" />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-toac-blue-900/60">
        Retrouvez toute l&apos;actualité du club en images sur notre compte Instagram.
      </p>
    </section>
  );
}
