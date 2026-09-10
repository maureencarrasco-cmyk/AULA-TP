import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aulatpchile.cl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aula TP Chile | Software educativo para formación TP",
    template: "%s | Aula TP Chile",
  },
  description:
    "Portal Docente y Simulador de Electricidad para liceos y centros técnico-profesionales en Chile. Solicita una demo para tu establecimiento, DAEM o coordinación académica.",
  keywords: [
    "Aula TP Chile",
    "Portal Docente",
    "Simulador de Electricidad",
    "educación técnico profesional",
    "software educativo Chile",
    "DAEM",
  ],
  authors: [{ name: "Aula TP Chile" }],
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: siteUrl,
    siteName: "Aula TP Chile",
    title: "Aula TP Chile | Software educativo para formación TP",
    description:
      "Digitaliza la formación técnico-profesional: Portal Docente y simuladores TP. Solicita una demo.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aula TP Chile | Software educativo para formación TP",
    description:
      "Portal Docente y Simulador de Electricidad para establecimientos chilenos. Solicita demo.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <head>
        {/* Canonical shared tokens (same-origin). Keep public/ + app/ copies byte-identical; sync from /opt/aulatp/landing/shared/ on deploy. */}
        {/* eslint-disable-next-line @next/next/no-css-tags -- canonical same-origin shared tokens */}
        <link rel="stylesheet" href="/shared/aula-tp-design-tokens.css" />
      </head>
      <body
        className={`${inter.variable} ${plexMono.variable} min-h-screen bg-[var(--color-surface)] font-sans text-[var(--color-ink)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
