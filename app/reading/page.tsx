"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  Coins,
  Compass,
  GraduationCap,
  Heart,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { FollowUpChat } from "@/components/FollowUpChat";
import { PlanetCard } from "@/components/PlanetCard";
import { ReadingHeader } from "@/components/ReadingHeader";
import { ReadingSection } from "@/components/ReadingSection";
import { Button } from "@/components/ui/button";
import { buildChatContext, clearReading, loadReading } from "@/lib/reading-store";
import type { StoredReading } from "@/types/astrology";

export default function ReadingPage() {
  const router = useRouter();
  const [stored, setStored] = useState<StoredReading | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStored(loadReading());
    setReady(true);
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
          />

          {(reading.strengths.length > 0 || reading.challenges.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ListPanel title="Core strengths" items={reading.strengths} tone="gold" />
              <ListPanel title="Growth areas" items={reading.challenges} tone="primary" />
            </div>
          )}

          {reading.planetaryInsights.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-2xl">Planetary influences</h2>
              <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 print:mx-0 print:grid print:gap-3 print:overflow-visible print:px-0">
                {reading.planetaryInsights.map((insight, i) => (
                  <PlanetCard key={`${insight.planet}-${i}`} insight={insight} index={i} />
                ))}
              </div>
            </section>
          )}

          {reading.houseInsights.length > 0 && (
            <section className="glass-panel print-plain rounded-3xl p-6 sm:p-8">
              <h2 className="font-display text-2xl">Houses & life areas</h2>
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
            </section>
          )}

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
              />
            ))}
          </div>

          {reading.guidance.length > 0 && (
            <section className="glass-panel print-plain rounded-3xl p-6 sm:p-8">
              <h2 className="font-display text-2xl">Practical guidance</h2>
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
            </section>
          )}

          <FollowUpChat context={buildChatContext(stored)} />

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            {reading.disclaimer}
          </p>
        </div>
      </div>
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
