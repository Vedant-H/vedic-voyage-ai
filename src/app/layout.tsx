import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter_Tight } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import "../styles.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CosmicLens AI — AI Vedic Astrology Readings",
  description: "Personalised AI-generated Vedic astrology readings from your birth date, time and place.",
  authors: [{ name: "CosmicLens AI" }],
  openGraph: {
    title: "CosmicLens AI — AI Vedic Astrology Readings",
    description: "Personalised AI-generated Vedic astrology readings from your birth date, time and place.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0b18",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

