import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Avisly | Boostez vos avis Google par le jeu",
  description: "Avisly transforme vos clients en ambassadeurs. Utilisez la gamification (roue de la fortune) pour récolter plus d'avis Google et améliorer votre SEO local.",
  icons: {
    icon: "/logo_avisly.svg",
    apple: "/logo_avisly.svg",
  },
  openGraph: {
    title: "Avisly | Votre SEO Local par le jeu",
    description: "Le premier SaaS qui transforme vos clients en ambassadeurs grâce à la gamification.",
    url: "https://avisly.fr",
    siteName: "Avisly",
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d1dd7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
