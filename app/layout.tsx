import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CosmicLens AI",
  description:
    "AI-powered Vedic astrology readings, personalized birth-chart reflections, and follow-up guidance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
