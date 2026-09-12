"use client";

import React, { useMemo } from "react";
import { CheckCircle2, Orbit } from "lucide-react";
import type { CompleteVedicChart } from "@/lib/vedic";
import { calculateGocharaTransits } from "@/lib/vedic/transits";

interface Props {
  natalChart: CompleteVedicChart;
}

export function GocharaTransitViewer({ natalChart }: Props) {
  const report = useMemo(() => calculateGocharaTransits(natalChart), [natalChart]);
  const { transits, specialEvents } = report;

  const transitDateFormatted = new Date(report.timestamp).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            <Orbit className="size-3.5 animate-spin" style={{ animationDuration: "12s" }} />
            Live Celestial Transits (Gochara)
          </span>
          <h3 className="font-display text-xl sm:text-2xl mt-1 text-foreground">
            Current Planetary Movements Over Your Chart
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Computed in real-time for <strong className="text-foreground">{transitDateFormatted}</strong> using Lahiri Ephemeris.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs text-emerald-300 font-medium self-start sm:self-auto">
          ● Live Sky Synchronization Active
        </div>
      </div>

      {/* Special Transit Highlights Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sade Sati Card */}
        <div
          className={`rounded-2xl border p-4 backdrop-blur-sm transition-all ${
            specialEvents.sadeSati.active
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-border/60 bg-secondary/20 text-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Saturn Sade Sati
            </span>
            {specialEvents.sadeSati.active ? (
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                {specialEvents.sadeSati.phase} Phase
              </span>
            ) : (
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                Inactive
              </span>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {specialEvents.sadeSati.description}
          </p>
        </div>

        {/* Jupiter Transit Card */}
        <div
          className={`rounded-2xl border p-4 backdrop-blur-sm transition-all ${
            specialEvents.jupiterTransit.isFavorable
              ? "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)]"
              : "border-border/60 bg-secondary/20 text-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Jupiter (Guru) Transit
            </span>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                specialEvents.jupiterTransit.isFavorable
                  ? "bg-[var(--gold)]/20 text-[var(--gold)]"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              House {specialEvents.jupiterTransit.houseFromMoon} from Moon
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {specialEvents.jupiterTransit.description}
          </p>
        </div>

        {/* Kantaka / Ashtama Shani */}
        <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shani Dhaiya / Kantaka
            </span>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                specialEvents.kantakaShani.active || specialEvents.ashtamaShani.active
                  ? "bg-rose-500/20 text-rose-400 font-bold"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {specialEvents.kantakaShani.active
                ? "Kantaka Active"
                : specialEvents.ashtamaShani.active
                ? "Ashtama Active"
                : "Clear"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {specialEvents.kantakaShani.active
              ? specialEvents.kantakaShani.description
              : specialEvents.ashtamaShani.active
              ? specialEvents.ashtamaShani.description
              : "Neither 4th nor 8th Saturn transit affliction is active."}
          </p>
        </div>

        {/* Rahu - Ketu Axis */}
        <div className="rounded-2xl border border-border/60 bg-secondary/20 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rahu-Ketu Axis
            </span>
            <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {specialEvents.rahuKetuAxis.rahuHouse}H / {specialEvents.rahuKetuAxis.ketuHouse}H
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {specialEvents.rahuKetuAxis.description}
          </p>
        </div>
      </div>

      {/* Live Transits Table */}
      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-secondary/15 backdrop-blur-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/40 text-muted-foreground uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Planet</th>
              <th className="p-3.5">Live Sign</th>
              <th className="p-3.5">Degree</th>
              <th className="p-3.5">From Lagna</th>
              <th className="p-3.5">From Moon</th>
              <th className="p-3.5">Influence</th>
              <th className="p-3.5 min-w-[240px]">Transit Interpretation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {Object.values(transits).map((t) => (
              <tr key={t.planet} className="hover:bg-secondary/30 transition-colors">
                <td className="p-3.5 font-semibold text-foreground flex items-center gap-1.5">
                  <span className="text-base text-[var(--gold)]">{t.glyph}</span>
                  {t.planet}
                  {t.isRetrograde && (
                    <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                      R
                    </span>
                  )}
                </td>
                <td className="p-3.5">
                  <span className="font-medium text-foreground">{t.signName}</span>
                  <span className="block text-[10px] text-muted-foreground">{t.signSanskrit}</span>
                </td>
                <td className="p-3.5 text-muted-foreground">{t.formattedPosition}</td>
                <td className="p-3.5 font-medium text-foreground">House {t.transitHouseFromLagna}</td>
                <td className="p-3.5 font-medium text-foreground">House {t.transitHouseFromMoon}</td>
                <td className="p-3.5">
                  {t.isBeneficTransit ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="size-2.5" /> Favorable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Reflective
                    </span>
                  )}
                </td>
                <td className="p-3.5 text-muted-foreground text-[11px] leading-relaxed">
                  {t.effectSummary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
