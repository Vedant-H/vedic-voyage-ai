"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Loader2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadReading } from "@/lib/reading-store";
import type { KundliMilanResult } from "@/lib/vedic/milan";

interface PartnerInput {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  cityName: string;
}

export default function MilanPage() {
  const [p1, setP1] = useState<PartnerInput>({
    name: "Partner 1",
    dateOfBirth: "",
    timeOfBirth: "12:00",
    cityName: "New Delhi, India",
  });

  const [p2, setP2] = useState<PartnerInput>({
    name: "Partner 2",
    dateOfBirth: "",
    timeOfBirth: "12:00",
    cityName: "Mumbai, India",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    milanResult: KundliMilanResult;
    aiCommentary: string;
    partner1: { ascendant: string; moon: string; nakshatra: string };
    partner2: { ascendant: string; moon: string; nakshatra: string };
  } | null>(null);

  // If the user already generated a reading in this session, pre-fill Partner 1
  useEffect(() => {
    const saved = loadReading();
    if (saved?.birth) {
      setP1({
        name: saved.birth.name || "You",
        dateOfBirth: saved.birth.dateOfBirth || "",
        timeOfBirth: saved.birth.timeOfBirth || "12:00",
        cityName: [saved.birth.birthCity, saved.birth.birthCountry].filter(Boolean).join(", "),
      });
    }
  }, []);

  async function handleMatch(e: React.FormEvent) {
    e.preventDefault();
    if (!p1.dateOfBirth || !p2.dateOfBirth) {
      alert("Please enter birth dates for both partners.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/milan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birth1: {
            name: p1.name,
            dateOfBirth: p1.dateOfBirth,
            timeOfBirth: p1.timeOfBirth || "12:00",
            cityName: p1.cityName,
          },
          birth2: {
            name: p2.name,
            dateOfBirth: p2.dateOfBirth,
            timeOfBirth: p2.timeOfBirth || "12:00",
            cityName: p2.cityName,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Matching calculation failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert(err.message || "Failed to calculate compatibility.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="starfield min-h-screen bg-background">
      <div className="cosmic-bg min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16 space-y-10">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3.5 py-1 text-xs text-[var(--gold)] font-medium mb-3">
              <Heart className="size-3.5 fill-[var(--gold)]" />
              <span>Ashta-Kuta 36-Point Vedic Synastry Engine</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Kundli Milan &amp; Relationship Compatibility
            </h1>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Enter both birth profiles to calculate canonical Guna Milan across all 8 classical dimensions, assess Manglik alignment, and receive AI relationship counsel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleMatch} className="glass-panel rounded-3xl p-6 sm:p-9 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Partner 1 */}
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary font-bold">
                      1
                    </span>
                    Partner 1 (You)
                  </h3>
                  <span className="text-xs text-[var(--gold)] font-medium">First Chart</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Full Name</label>
                    <Input
                      value={p1.name}
                      onChange={(e) => setP1({ ...p1, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Birth Date *</label>
                      <Input
                        type="date"
                        required
                        value={p1.dateOfBirth}
                        onChange={(e) => setP1({ ...p1, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Birth Time</label>
                      <Input
                        type="time"
                        value={p1.timeOfBirth}
                        onChange={(e) => setP1({ ...p1, timeOfBirth: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Birth City / Country</label>
                    <Input
                      value={p1.cityName}
                      onChange={(e) => setP1({ ...p1, cityName: e.target.value })}
                      placeholder="e.g. New Delhi, India"
                    />
                  </div>
                </div>
              </div>

              {/* Partner 2 */}
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[var(--gold)]/20 text-xs text-[var(--gold)] font-bold">
                      2
                    </span>
                    Partner 2 (Partner)
                  </h3>
                  <span className="text-xs text-primary font-medium">Second Chart</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Full Name</label>
                    <Input
                      value={p2.name}
                      onChange={(e) => setP2({ ...p2, name: e.target.value })}
                      placeholder="e.g. Priya Patel"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Birth Date *</label>
                      <Input
                        type="date"
                        required
                        value={p2.dateOfBirth}
                        onChange={(e) => setP2({ ...p2, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Birth Time</label>
                      <Input
                        type="time"
                        value={p2.timeOfBirth}
                        onChange={(e) => setP2({ ...p2, timeOfBirth: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Birth City / Country</label>
                    <Input
                      value={p2.cityName}
                      onChange={(e) => setP2({ ...p2, cityName: e.target.value })}
                      placeholder="e.g. Mumbai, India"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-xs text-muted-foreground">
                Mathematical ephemeris calculations will compute Moon Nakshatras, Rashis &amp; all 8 Kutas.
              </span>
              <Button
                type="submit"
                size="lg"
                disabled={loading || !p1.dateOfBirth || !p2.dateOfBirth}
                className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-semibold px-8 shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Calculating 36-Point Compatibility...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Calculate Compatibility Match
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Match Results Display */}
          {result && (
            <div className="space-y-8 animate-in fade-in duration-400">
              {/* Score Hero Banner */}
              <div className="glass-panel overflow-hidden rounded-3xl border border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/10 via-secondary/20 to-primary/10 p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left space-y-2">
                    <span className="rounded-full bg-[var(--gold)]/20 px-3.5 py-1 text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
                      {result.milanResult.verdictSanskrit} · {result.milanResult.verdict}
                    </span>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                      {p1.name} &amp; {p2.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span>
                        {p1.name}: <strong className="text-foreground">{result.partner1.moon} ({result.partner1.nakshatra})</strong>
                      </span>
                      <span>·</span>
                      <span>
                        {p2.name}: <strong className="text-foreground">{result.partner2.moon} ({result.partner2.nakshatra})</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="flex size-28 items-center justify-center rounded-full border-4 border-[var(--gold)] bg-background text-center shadow-2xl">
                      <div>
                        <span className="font-display text-4xl font-black text-foreground">
                          {result.milanResult.totalScore}
                        </span>
                        <span className="block text-[11px] text-muted-foreground uppercase font-semibold">
                          / 36 Gunas
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[var(--gold)] mt-2">
                      {result.milanResult.percentage}% Harmony Score
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Astrological & Relational Synthesis */}
              {result.aiCommentary && (
                <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-primary/30">
                  <h3 className="font-display text-xl font-bold flex items-center gap-2 text-foreground mb-3">
                    <Sparkles className="size-5 text-[var(--gold)]" />
                    AI Astrological &amp; Relational Synthesis
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {result.aiCommentary}
                  </p>
                </section>
              )}

              {/* Manglik Analysis Card */}
              <div
                className={`rounded-3xl border p-6 sm:p-8 ${
                  result.milanResult.manglikAnalysis.isCompatible
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-amber-500/30 bg-amber-500/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-bold flex items-center gap-2">
                    <ShieldAlert
                      className={`size-5 ${
                        result.milanResult.manglikAnalysis.isCompatible
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    />
                    Manglik (Kuja Dosha) Compatibility
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      result.milanResult.manglikAnalysis.isCompatible
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {result.milanResult.manglikAnalysis.isCompatible
                      ? "Harmonious & Cancelled"
                      : "Remedial Caution"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {result.milanResult.manglikAnalysis.summary}
                </p>
              </div>

              {/* 8 Kutas Detailed Breakdown Table */}
              <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Detailed 8 Kutas Breakdown (36 Gunas)
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-secondary/40 text-muted-foreground uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="p-3.5">Kuta</th>
                        <th className="p-3.5">Governs</th>
                        <th className="p-3.5 text-center">Score</th>
                        <th className="p-3.5 min-w-[280px]">Classical Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {Object.values(result.milanResult.kutas).map((k) => (
                        <tr key={k.name} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-3.5 font-semibold text-foreground">
                            {k.name}
                            <span className="block text-[11px] text-muted-foreground font-normal">
                              {k.sanskrit}
                            </span>
                          </td>
                          <td className="p-3.5 text-muted-foreground text-xs">
                            {k.name === "Varna" && "Ego & Spiritual Path"}
                            {k.name === "Vashya" && "Mutual Magnetism"}
                            {k.name === "Tara" && "Destiny & Longevity"}
                            {k.name === "Yoni" && "Physical / Instinctual"}
                            {k.name === "Graha Maitri" && "Mental Friendship"}
                            {k.name === "Gana" && "Temperament & Nature"}
                            {k.name === "Bhakoot" && "Family & Finances"}
                            {k.name === "Nadi" && "Genetics & Vitality"}
                          </td>
                          <td className="p-3.5 text-center font-bold text-foreground">
                            <span
                              className={`rounded-lg px-2.5 py-1 text-xs ${
                                k.status === "Full"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : k.status === "Partial"
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {k.pointsReceived} / {k.maxPoints}
                            </span>
                          </td>
                          <td className="p-3.5 text-muted-foreground text-xs leading-relaxed">
                            {k.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Remedies & Harmonization Practices */}
              {result.milanResult.synthesis.remedialAdvice.length > 0 && (
                <section className="glass-panel rounded-3xl p-6 sm:p-8">
                  <h3 className="font-display text-xl font-bold text-[var(--gold)] mb-4">
                    Classical Relational Remedies &amp; Habits
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.milanResult.synthesis.remedialAdvice.map((r, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-border bg-secondary/30 p-4 flex items-start gap-3"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold)] font-bold text-xs">
                          {i + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {r}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
