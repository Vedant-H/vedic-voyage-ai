"use client";

import React, { useState } from "react";
import {
  Heart,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { VaultChartItem } from "@/app/vault/page";
import type { KundliMilanResult } from "@/lib/vedic/milan";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultCharts: VaultChartItem[];
}

export function KundliMilanModal({ open, onOpenChange, vaultCharts }: Props) {
  const [partner1Id, setPartner1Id] = useState<string>(vaultCharts[0]?.id || "");
  const [partner2Id, setPartner2Id] = useState<string>(vaultCharts[1]?.id || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    milanResult: KundliMilanResult;
    aiCommentary: string;
    partner1: { ascendant: string; moon: string; nakshatra: string };
    partner2: { ascendant: string; moon: string; nakshatra: string };
  } | null>(null);

  async function handleMatch() {
    if (!partner1Id || !partner2Id) {
      alert("Please select both partners to calculate Kundli Milan.");
      return;
    }
    if (partner1Id === partner2Id) {
      alert("Please select two different profiles for compatibility matching.");
      return;
    }

    const c1 = vaultCharts.find((c) => c.id === partner1Id);
    const c2 = vaultCharts.find((c) => c.id === partner2Id);

    if (!c1 || !c2) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/milan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chart1: c1.chart_data,
          chart2: c2.chart_data,
          birth1: {
            name: c1.name,
            dateOfBirth: c1.date_of_birth,
            timeOfBirth: c1.time_of_birth,
          },
          birth2: {
            name: c2.name,
            dateOfBirth: c2.date_of_birth,
            timeOfBirth: c2.time_of_birth,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to calculate Milan");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      alert(err.message || "Compatibility matching failed");
    } finally {
      setLoading(false);
    }
  }

  const p1 = vaultCharts.find((c) => c.id === partner1Id);
  const p2 = vaultCharts.find((c) => c.id === partner2Id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-border/80 bg-background/95 p-6 backdrop-blur-2xl sm:p-8">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--gold)]">
            <Heart className="size-3.5 fill-[var(--gold)] text-[var(--gold)]" />
            Ashta-Kuta 36-Point Kundli Milan
          </div>
          <DialogTitle className="font-display text-2xl sm:text-3xl">
            Vedic Relationship Synastry & Compatibility
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Canonical 36-point Guna Milan matching based on Nakshatras, Moon signs, and BPHS relational canons.
          </DialogDescription>
        </DialogHeader>

        {/* Profile Selectors */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 rounded-2xl border border-border/80 bg-secondary/20 p-4 sm:p-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Partner 1 (Self / Profile A)
            </label>
            <select
              value={partner1Id}
              onChange={(e) => setPartner1Id(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select profile...</option>
              {vaultCharts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.relationship} · {c.date_of_birth})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Partner 2 (Partner / Profile B)
            </label>
            <select
              value={partner2Id}
              onChange={(e) => setPartner2Id(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select profile...</option>
              {vaultCharts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.relationship} · {c.date_of_birth})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button
              onClick={handleMatch}
              disabled={loading || !partner1Id || !partner2Id}
              className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-medium px-6"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" /> Calculating Ephemeris Match...
                </>
              ) : (
                <>
                  <Sparkles className="size-4 mr-2" /> Calculate 36-Point Compatibility
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results View */}
        {result && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-300">
            {/* Score Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-[var(--gold)]/40 bg-gradient-to-r from-[var(--gold)]/10 via-secondary/20 to-primary/10 p-6 sm:p-8">
              <div className="text-center sm:text-left">
                <span className="rounded-full bg-[var(--gold)]/20 px-3 py-1 text-xs font-bold text-[var(--gold)] uppercase tracking-wider">
                  {result.milanResult.verdictSanskrit} · {result.milanResult.verdict}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-foreground">
                  {p1?.name} &amp; {p2?.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.partner1.moon} ({result.partner1.nakshatra}) + {result.partner2.moon} ({result.partner2.nakshatra})
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex size-24 items-center justify-center rounded-full border-4 border-[var(--gold)] bg-background text-center shadow-lg">
                  <div>
                    <span className="font-display text-3xl font-black text-foreground">
                      {result.milanResult.totalScore}
                    </span>
                    <span className="block text-[10px] text-muted-foreground uppercase font-semibold">
                      / 36 Points
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-[var(--gold)] mt-2">
                  {result.milanResult.percentage}% Match
                </span>
              </div>
            </div>

            {/* AI Synthesized Counseling Commentary */}
            {result.aiCommentary && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5 mb-2">
                  <Sparkles className="size-3.5" />
                  AI Astrological &amp; Relational Synthesis
                </h4>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {result.aiCommentary}
                </p>
              </div>
            )}

            {/* Manglik Match Assessment */}
            <div
              className={`rounded-2xl border p-4 sm:p-5 ${
                result.milanResult.manglikAnalysis.isCompatible
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-amber-500/30 bg-amber-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display text-base font-semibold flex items-center gap-2">
                  <ShieldAlert
                    className={`size-4 ${
                      result.milanResult.manglikAnalysis.isCompatible
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  />
                  Manglik (Kuja) Dosha Alignment
                </h4>
                <span
                  className={`rounded px-2.5 py-0.5 text-xs font-bold ${
                    result.milanResult.manglikAnalysis.isCompatible
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {result.milanResult.manglikAnalysis.isCompatible
                    ? "Harmonious"
                    : "Caution Advised"}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {result.milanResult.manglikAnalysis.summary}
              </p>
            </div>

            {/* 8 Kutas Detailed Table */}
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/40 text-muted-foreground uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Kuta (Dimension)</th>
                    <th className="p-3">Governs</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 min-w-[260px]">Astrological Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {Object.values(result.milanResult.kutas).map((k) => (
                    <tr key={k.name} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-semibold text-foreground">
                        {k.name}
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          {k.sanskrit}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground text-[11px]">
                        {k.name === "Varna" && "Ego & Spiritual Path"}
                        {k.name === "Vashya" && "Mutual Magnetism"}
                        {k.name === "Tara" && "Destiny & Longevity"}
                        {k.name === "Yoni" && "Physical / Instinctual"}
                        {k.name === "Graha Maitri" && "Mental Friendship"}
                        {k.name === "Gana" && "Temperament & Nature"}
                        {k.name === "Bhakoot" && "Family & Finances"}
                        {k.name === "Nadi" && "Genetics & Vitality"}
                      </td>
                      <td className="p-3 text-center font-bold text-foreground">
                        <span
                          className={`rounded px-2 py-0.5 text-xs ${
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
                      <td className="p-3 text-muted-foreground text-[11px] leading-relaxed">
                        {k.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Remedies & Guidance */}
            {result.milanResult.synthesis.remedialAdvice.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-secondary/20 p-4 sm:p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--gold)] mb-2">
                  Classical Relational Guidance &amp; Remedies
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {result.milanResult.synthesis.remedialAdvice.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--gold)] mt-0.5">✦</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
