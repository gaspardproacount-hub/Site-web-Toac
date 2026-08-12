import type { Metadata } from "next";
import { Suspense } from "react";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { getCmsPageBlocks, getCmsCatalog, getCmsSiteSettings, getCmsNavigation } from "@/lib/cms";
import { buildThemeCss } from "@/lib/theme";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = "https://toac-triathlon.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TOAC Triathlon — Club de triathlon à Toulouse",
    template: "%s — TOAC Triathlon",
  },
  description:
    "TOAC Triathlon, club toulousain de triathlon affilié FFTRI depuis 1992. Entraînements natation, vélo, course à pied, musculation, et organisateur des Triathlons du Lauragais.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "TOAC Triathlon",
    title: "TOAC Triathlon — Club de triathlon à Toulouse",
    description:
      "Nager, rouler, courir à Toulouse depuis 1992. Rejoignez le TOAC Triathlon.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cmsNavigation, footerBlocks, cmsCatalog, cmsSettings] = await Promise.all([
    getCmsNavigation(),
    getCmsPageBlocks("footer"),
    getCmsCatalog(),
    getCmsSiteSettings(),
  ]);
  const partenairesSection = cmsCatalog?.find((s) => s.name === "Partenaires");
  const themeCss = buildThemeCss(cmsSettings?.theme);

  return (
    <html lang="fr" className={`${anton.variable} ${inter.variable} h-full antialiased`}>
      {themeCss && (
        <head>
          <style id="cms-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />
        </head>
      )}
      <body className="flex min-h-full flex-col bg-white text-toac-blue-950">
        <AuthProvider>
          <Suspense fallback={null}>
            <Navbar items={cmsNavigation.nav} />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Suspense fallback={null}>
            <Footer
              footerBlocks={footerBlocks}
              footerItems={cmsNavigation.footer}
              partenairesSection={partenairesSection}
              socialLinks={cmsSettings?.social_links}
              email={cmsSettings?.email}
            />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
