"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Coins,
  Compass,
  Crown,
  GraduationCap,
  Heart,
  Lock,
  Sparkles,
  Sun,
  User,
} from "lucide-react";

import { FollowUpChat } from "@/components/FollowUpChat";
import { PlanetCard } from "@/components/PlanetCard";
import { ReadingHeader } from "@/components/ReadingHeader";
import { ReadingSection } from "@/components/ReadingSection";
import { Button } from "@/components/ui/button";
import {
  buildChatContext,
  clearReading,
  isAccountOrProfileUnlocked,
  loadReading,
  markProfileUnlocked,
  markReadingUnlocked,
  saveReading,
} from "@/lib/reading-store";
import { KundliViewer } from "@/components/charts/KundliViewer";
import { CosmicWeatherBar } from "@/components/CosmicWeatherBar";
import { UnlockModal } from "@/components/monetization/UnlockModal";
import { PremiumPaywallBanner } from "@/components/monetization/PremiumPaywallBanner";
import type { StoredReading } from "@/types/astrology";

export default function ReadingPage() {
  const router = useRouter();
  const [stored, setStored] = useState<StoredReading | null>(null);
  const [ready, setReady] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);

  useEffect(() => {
    function checkUnlockAndLoad() {
      const loaded = loadReading();

      if (loaded) {
        const isUnlocked = isAccountOrProfileUnlocked({
          name: loaded.birth?.name,
          dateOfBirth: loaded.birth?.dateOfBirth,
        });

        loaded.isUnlocked = isUnlocked;
        loaded.plan = isUnlocked ? "premium" : "free";
      }

      setStored(loaded ? { ...loaded } : null);
      setReady(true);
    }

    checkUnlockAndLoad();
  }, []);

  if (!ready) return <div className="min-h-screen bg-background" />;

  if (!stored) {
    return (
      <main className="starfield flex min-h-screen items-center justify-center bg-background px-4">
        <div className="glass-panel max-w-md rounded-3xl p-8 text-center">
          <h1 className="font-display text-2xl">No reading found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your reading is kept only in this browser session. Please generate a new one.
          </p>
          <Button className="mt-6" onClick={() => router.push("/")}>
            <Sparkles className="size-4" aria-hidden="true" /> Start a new reading
          </Button>
        </div>
      </main>
    );
  }

  const { reading } = stored;
  const sections = [
    { title: reading.personality.title || "Personality", icon: User, content: reading.personality.content },
    { title: reading.career.title || "Career & purpose", icon: Briefcase, content: reading.career.content },
    { title: reading.finance.title || "Money & finances", icon: Coins, content: reading.finance.content },
    { title: reading.relationships.title || "Relationships", icon: Heart, content: reading.relationships.content },
    { title: reading.education.title || "Learning & education", icon: GraduationCap, content: reading.education.content },
    { title: reading.spirituality.title || "Spiritual path", icon: Compass, content: reading.spirituality.content },
    { title: reading.currentFocus.title || "Current themes", icon: Sun, content: reading.currentFocus.content },
  ];

  return (
    <main className="starfield min-h-screen bg-background print:bg-white">
      <div className="cosmic-bg">
        <div className="mx-auto max-w-4xl space-y-10 px-4 py-12 sm:py-16">
          <ReadingHeader
            stored={stored}
            onRestart={() => {
              clearReading();
              router.push("/");
            }}
            onUnlock={() => setUnlockOpen(true)}
          />

          {stored.vedicChart && <CosmicWeatherBar chart={stored.vedicChart} />}

          {stored.vedicChart && <KundliViewer chart={stored.vedicChart} />}

          {(reading.strengths.length > 0 || reading.challenges.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ListPanel title="Core strengths" items={reading.strengths} tone="gold" />
              <ListPanel title="Growth areas" items={reading.challenges} tone="primary" />
            </div>
          )}

          {reading.planetaryInsights.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl">Planetary influences</h2>
                {!stored.isUnlocked && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--gold)]">
                    <Lock className="size-3" /> Preview (2 of {reading.planetaryInsights.length})
                  </span>
                )}
              </div>
              <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 print:mx-0 print:grid print:gap-3 print:overflow-visible print:px-0">
                {(stored.isUnlocked
                  ? reading.planetaryInsights
                  : reading.planetaryInsights.slice(0, 2)
                ).map((insight, i) => (
                  <PlanetCard key={`${insight.planet}-${i}`} insight={insight} index={i} />
                ))}

                {!stored.isUnlocked && (
                  <div className="flex shrink-0 snap-start flex-col justify-between rounded-3xl border border-[var(--gold)]/30 bg-gradient-to-b from-[var(--gold)]/10 via-background/90 to-background/95 p-6 sm:p-7 min-w-[280px] max-w-[320px] text-center shadow-lg">
                    <div>
                      <div className="mx-auto flex size-10 items-center justify-center rounded-2xl bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30 mb-3">
                        <Lock className="size-5" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {Math.max(0, reading.planetaryInsights.length - 2)} More Planets Locked
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        Mars, Mercury, Jupiter, Venus, Saturn, Rahu & Ketu placements, dignity, and degrees.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setUnlockOpen(true)}
                      className="mt-4 bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-semibold text-xs shadow-md"
                    >
                      <Sparkles className="size-3.5 mr-1" /> Unlock Planets (₹1,499)
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}

          {reading.houseInsights.length > 0 && (
            <section className="glass-panel print-plain rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl">Houses & life areas</h2>
                {!stored.isUnlocked && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--gold)]">
                    <Lock className="size-3" /> House 1 Preview
                  </span>
                )}
              </div>

              {stored.isUnlocked ? (
                <dl className="mt-5 space-y-4">
                  {reading.houseInsights.map((h, i) => (
                    <div key={`${h.house}-${i}`} className="border-t border-border pt-4 first:border-0 first:pt-0">
                      <dt className="text-sm font-medium">
                        {h.house}
                        {h.area ? ` · ${h.area}` : ""}
                      </dt>
                      <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {h.interpretation}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <div className="mt-3 space-y-4">
                  {/* House 1 preview (unlocked) */}
                  {reading.houseInsights.slice(0, 1).map((h, i) => (
                    <div key={`${h.house}-${i}`} className="border-b border-border/60 pb-4">
                      <dt className="text-sm font-medium text-[var(--gold)]">
                        {h.house}
                        {h.area ? ` · ${h.area}` : ""} (Preview)
                      </dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {h.interpretation}
                      </dd>
                    </div>
                  ))}

                  {/* Houses 2-12 blurred teaser */}
                  <div className="relative mt-4 overflow-hidden rounded-2xl border border-border/80 bg-background/50">
                    <dl className="space-y-4 p-5 opacity-15 select-none blur-[3px] pointer-events-none">
                      {reading.houseInsights.slice(1, 4).map((h, i) => (
                        <div key={`${h.house}-${i}`} className="border-t border-border pt-4 first:border-0 first:pt-0">
                          <dt className="text-sm font-medium">{h.house}{h.area ? ` · ${h.area}` : ""}</dt>
                          <dd className="mt-1 text-sm">{h.interpretation}</dd>
                        </div>
                      ))}
                    </dl>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-background/95 via-background/85 to-transparent">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 mb-2 shadow-md">
                        <Lock className="size-4" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Houses 2–12 Destiny Blueprint Locked
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                        Unlock Dhana (Wealth), Karma (Career), Kalatra (Marriage), and Bhagyasthana (Destiny) houses.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setUnlockOpen(true)}
                        className="mt-3.5 bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-semibold text-xs shadow-md"
                      >
                        <Sparkles className="size-3.5 mr-1" />
                        Unlock All 12 Houses (₹1,499)
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Dossier Badge or Paywall Banner */}
          {stored.isUnlocked ? (
            <div className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-400">
              <div className="flex items-center gap-2 font-medium">
                <Crown className="size-4" />
                <span>Complete Vedic Master Dossier · Unlocked</span>
              </div>
              <span className="text-xs uppercase tracking-wider text-emerald-400/80">
                Lifetime Parashari Access
              </span>
            </div>
          ) : (
            <PremiumPaywallBanner onUnlockClick={() => setUnlockOpen(true)} />
          )}

          {/* All 7 Detailed Sections */}
          <div className="space-y-4">
            <h2 className="font-display text-2xl">Your reading in detail</h2>
            {sections.map((s, i) => (
              <ReadingSection
                key={s.title}
                index={i + 1}
                title={s.title}
                icon={s.icon}
                content={s.content}
                defaultOpen={i === 0}
                isLocked={!stored.isUnlocked && i > 0}
                onUnlock={() => setUnlockOpen(true)}
              />
            ))}
          </div>

          {/* Practical Guidance & Remedies */}
          {reading.guidance.length > 0 && (
            <section className="glass-panel print-plain relative overflow-hidden rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl">Practical guidance & BPHS remedies</h2>
                {!stored.isUnlocked && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--gold)]">
                    <Lock className="size-3.5" />
                    Premium Remedies
                  </span>
                )}
              </div>

              {!stored.isUnlocked ? (
                <div className="relative">
                  <ul className="grid gap-4 sm:grid-cols-2 opacity-25 select-none blur-[2px] pointer-events-none">
                    {reading.guidance.map((g, i) => (
                      <li key={`${g.title}-${i}`} className="rounded-2xl border border-border bg-secondary/30 p-4">
                        <p className="text-sm font-medium">{g.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {g.description}
                        </p>
                      </li>
                    ))}
                  </ul>

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-t from-background/95 via-background/85 to-transparent rounded-2xl">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 mb-3 shadow-lg">
                      <Lock className="size-5" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      Classical Vedic Remedies Locked
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md">
                      Unlock authentic BPHS planetary remedies — Beej Mantras, gemstone recommendations, fasting protocols, and Daana guidelines tailored to your lagna and dasha.
                    </p>
                    <Button
                      size="default"
                      onClick={() => setUnlockOpen(true)}
                      className="mt-4 bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-semibold text-xs sm:text-sm shadow-xl"
                    >
                      <Sparkles className="size-3.5 mr-2" />
                      Unlock Classical Remedies (₹1,499)
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {reading.guidance.map((g, i) => (
                    <li key={`${g.title}-${i}`} className="rounded-2xl border border-border bg-secondary/30 p-4">
                      <p className="text-sm font-medium">{g.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {g.description}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Follow-up Chat Companion */}
          <FollowUpChat context={buildChatContext(stored)} />

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {reading.disclaimer}
          </p>
        </div>
      </div>

      <UnlockModal
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
        onUnlockSuccess={() => {
          const updated = markReadingUnlocked();
          if (updated) setStored(updated);
        }}
      />
    </main>
  );
}

function ListPanel({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "gold" | "primary";
}) {
  if (items.length === 0) return null;
  return (
    <section className="glass-panel print-plain rounded-3xl p-6">
      <h2 className="font-display text-xl">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span
              className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                tone === "gold" ? "bg-[var(--gold)]" : "bg-primary"
              }`}
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
