"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Clock,
  Compass,
  FolderLock,
  Heart,
  Moon,
  Orbit,
  ShieldCheck,
  Sparkles,
  Stars,
  Wand2,
} from "lucide-react";

import { AstrologyForm } from "@/components/AstrologyForm";
import { CosmicChart } from "@/components/CosmicChart";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { Button } from "@/components/ui/button";
import { saveReading } from "@/lib/reading-store";
import { DISCLAIMER, type BirthDetails } from "@/types/astrology";

const FEATURES = [
  {
    icon: Orbit,
    title: "Astronomical Ephemeris & Kundli",
    body: "Arcsecond Lahiri math computing Ascendant, House Cusps, and interactive North and South Indian charts.",
  },
  {
    icon: Clock,
    title: "120-Year Life Timeline",
    body: "Scrub across your lifespan to inspect Mahadashas, Antardashas, and Pratyantardashas with period themes.",
  },
  {
    icon: Compass,
    title: "Live Gochara Transits",
    body: "Real-time planetary sky movements, Saturn Sade Sati detection, and auspicious Jupiter shifts.",
  },
  {
    icon: Heart,
    title: "36-Point Kundli Milan",
    body: "Canonical Ashta-Kuta relationship synastry, Kuja (Manglik) matching, and AI relational guidance.",
  },
  {
    icon: Wand2,
    title: "Push-to-Talk AI Companion",
    body: "Ask questions verbally or type to chat with an empathetic guide protected by crisis circuit breakers.",
  },
  {
    icon: FolderLock,
    title: "Encrypted Cosmic Vault",
    body: "Save multiple family charts, download high-res vector PDF dossiers, and share dynamic preview cards.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(birth: BirthDetails) {
    setError("");
    setStatus("loading");
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(birth),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate reading");
      }

      saveReading({ birth, ...data, isUnlocked: false });

      // If user is already authenticated, automatically back up to cloud vault
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          fetch("/api/vault", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: birth.name || "My Chart",
              relationship: "Self",
              date_of_birth: birth.dateOfBirth,
              time_of_birth: birth.timeOfBirth,
              city: [birth.birthCity, birth.birthState, birth.birthCountry].filter(Boolean).join(", "),
              chart_data: data.vedicChart,
              reading_data: data.reading,
            }),
          }).catch((e) => console.warn("Background auto-vault save notice:", e));
        }
      } catch {}

      router.push("/reading");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate reading. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "loading") {
    return (
      <main className="starfield min-h-screen bg-background">
        <div className="cosmic-bg min-h-screen">
          <LoadingAnalysis />
        </div>
      </main>
    );
  }

  return (
    <main className="starfield min-h-screen bg-background">
      <div className="cosmic-bg">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-16 sm:pt-24 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <Stars className="size-3.5 text-[var(--gold)]" aria-hidden="true" />
              CosmicLens AI
            </p>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] sm:text-6xl">
              A deeply personal Vedic reading, written for your birth chart
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Share your birth date, time and place. Our AI astrologer composes a detailed,
              chapter-by-chapter reading you can explore, question and save.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild className="shadow-lg">
                <a href="#reading-form">
                  <Sparkles className="size-4 mr-1.5" /> Start my reading
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10"
              >
                <Link href="/milan">
                  <Heart className="size-4 mr-1.5 fill-[var(--gold)]" /> Match Kundli Milan
                </Link>
              </Button>
              <span className="flex items-center gap-2 text-xs text-muted-foreground ml-1">
                <ShieldCheck className="size-4" aria-hidden="true" /> No account needed
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <CosmicChart className="mx-auto max-w-md" />
          </motion.div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article key={title} className="glass-panel rounded-2xl p-6">
              <span
                className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary"
                aria-hidden="true"
              >
                <Icon className="size-5" />
              </span>
              <h2 className="mt-4 font-display text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </section>

        <section id="reading-form" className="mx-auto max-w-6xl scroll-mt-8 px-4 pb-24">
          <h2 className="mb-8 text-center font-display text-3xl sm:text-4xl">
            Enter your birth details
          </h2>
          {error && (
            <p
              role="alert"
              className="mx-auto mb-6 max-w-2xl rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <AstrologyForm onSubmit={handleSubmit} />
        </section>

        <footer className="mx-auto max-w-3xl px-4 pb-16 text-center text-xs leading-relaxed text-muted-foreground">
          {DISCLAIMER}
        </footer>
      </div>
    </main>
  );
}
