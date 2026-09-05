"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Moon, Orbit, ShieldCheck, Sparkles, Stars, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { AstrologyForm } from "@/components/AstrologyForm";
import { CosmicChart } from "@/components/CosmicChart";
import { LoadingAnalysis } from "@/components/LoadingAnalysis";
import { Button } from "@/components/ui/button";
import { saveReading } from "@/lib/reading-store";
import { DISCLAIMER, type BirthDetails } from "@/types/astrology";

const TITLE = "CosmicLens AI — Personalised Vedic Astrology Readings";
const DESCRIPTION =
  "Enter your birth details and receive a detailed AI-generated Vedic astrology reading covering personality, career, relationships, finances and spiritual growth.";

const FEATURES = [
  {
    icon: Orbit,
    title: "Planetary influences",
    body: "Traditional interpretations of each planet's role in your chart, written in plain language.",
  },
  {
    icon: Moon,
    title: "Twelve life areas",
    body: "Personality, career, money, relationships, education, spirituality and current themes.",
  },
  {
    icon: Wand2,
    title: "Ask follow-ups",
    body: "Chat with your reading and get answers grounded in what was generated for you.",
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
      const response = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(birth),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong. Please try again.");
      }

      saveReading({ birth, ...payload });
      router.push("/reading");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <a href="#reading-form">
                  <Sparkles className="size-4" aria-hidden="true" /> Start my reading
                </a>
              </Button>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
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

        <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-3">
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

export { TITLE, DESCRIPTION };
