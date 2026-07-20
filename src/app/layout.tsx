import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import { getCmsPageBlocks, getCmsCatalog } from "@/lib/cms";

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
  const [navBlocks, footerBlocks, cmsCatalog] = await Promise.all([
    getCmsPageBlocks("navigation"),
    getCmsPageBlocks("footer"),
    getCmsCatalog(),
  ]);
  const partenairesSection = cmsCatalog?.find((s) => s.name === "Partenaires");

  return (
    <html lang="fr" className={`${anton.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-toac-blue-950">
        <AuthProvider>
          <Navbar navBlocks={navBlocks} />
          <main className="flex-1">{children}</main>
          <Footer footerBlocks={footerBlocks} partenairesSection={partenairesSection} />
        </AuthProvider>
      </body>
    </html>
  );
}
