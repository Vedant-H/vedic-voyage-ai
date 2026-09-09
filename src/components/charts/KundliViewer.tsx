"use client";

import React, { useState } from "react";
import { Compass, Flame, ShieldAlert, Sparkles, Star } from "lucide-react";
import type { CompleteVedicChart } from "@/lib/vedic";
import { NorthIndianChart } from "./NorthIndianChart";
import { SouthIndianChart } from "./SouthIndianChart";
import { DashaTimelineScrubber } from "./DashaTimelineScrubber";
import { GocharaTransitViewer } from "./GocharaTransitViewer";

interface Props {
  chart: CompleteVedicChart;
}

export function KundliViewer({ chart }: Props) {
  const [style, setStyle] = useState<"north" | "south">("north");
  const [activeTab, setActiveTab] = useState<"chart" | "planets" | "yogas" | "timeline" | "transits">("chart");

  const { ascendant, planets, analysis, dasha, ayanamsha } = chart;
  const currentDasha = dasha.current;

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[var(--gold)]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Vedic Birth Chart (Janma Kundli)
          </p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl">
            {ascendant.signName} Ascendant · {planets["Moon"]?.signName} Rashi
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Nakshatra: <span className="text-foreground">{planets["Moon"]?.nakshatra.name} (Pada {planets["Moon"]?.pada})</span> · Ayanamsha: {ayanamsha.formatted}
          </p>
        </div>

        {/* Tab & Style Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-secondary/40 p-1 border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("chart")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "chart" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Chart
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("planets")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "planets" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Planets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("yogas")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "yogas" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yogas & Doshas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "timeline" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Timeline (120Y)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("transits")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "transits" ? "bg-emerald-500 text-black shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Transits (Live)
            </button>
          </div>

          {activeTab === "chart" && (
            <div className="inline-flex rounded-xl bg-secondary/40 p-1 border border-border">
              <button
                type="button"
                onClick={() => setStyle("north")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  style === "north" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                North Indian
              </button>
              <button
                type="button"
                onClick={() => setStyle("south")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  style === "south" ? "bg-accent text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                South Indian
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current Dasha Highlights */}
      {currentDasha && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs">
          <span className="font-semibold text-primary uppercase tracking-wider text-[10px]">
            Active Vimshottari Dasha:
          </span>
          <span className="rounded-md bg-background/60 px-2 py-0.5 font-medium text-foreground">
            Mahadasha: <strong className="text-[var(--gold)]">{currentDasha.mahadasha}</strong>
          </span>
          <span className="text-muted-foreground">➔</span>
          <span className="rounded-md bg-background/60 px-2 py-0.5 font-medium text-foreground">
            Antardasha: <strong className="text-foreground">{currentDasha.antardasha}</strong>
          </span>
          <span className="text-muted-foreground">➔</span>
          <span className="rounded-md bg-background/60 px-2 py-0.5 font-medium text-foreground">
            Pratyantardasha: {currentDasha.pratyantardasha}
          </span>
          <span className="text-[11px] text-muted-foreground ml-auto">
            Until {new Date(currentDasha.antardashaEnd).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
          </span>
        </div>
      )}

      {/* Main View: Chart */}
      {activeTab === "chart" && (
        <div className="pt-2">
          {style === "north" ? (
            <NorthIndianChart chart={chart} />
          ) : (
            <SouthIndianChart chart={chart} />
          )}
        </div>
      )}

      {/* Tab: Planetary Positions Table */}
      {activeTab === "planets" && (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/50 text-muted-foreground uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Planet</th>
                <th className="p-3">Sign</th>
                <th className="p-3">Degree</th>
                <th className="p-3">Nakshatra (Pada)</th>
                <th className="p-3">House</th>
                <th className="p-3">Dignity / State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr className="bg-secondary/20 font-medium">
                <td className="p-3 text-primary font-bold">Ascendant (Lagna)</td>
                <td className="p-3">{ascendant.signName} ({ascendant.signSanskrit})</td>
                <td className="p-3">{ascendant.formattedPosition}</td>
                <td className="p-3">{ascendant.nakshatra.name} ({ascendant.pada})</td>
                <td className="p-3">1st House</td>
                <td className="p-3 text-muted-foreground">Lagna Cusp</td>
              </tr>
              {Object.values(planets).map((p) => {
                const info = analysis.planets[p.name];
                return (
                  <tr key={p.name} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3 font-semibold text-foreground flex items-center gap-1.5">
                      <span className="text-base text-[var(--gold)]">{p.glyph}</span>
                      {p.name}
                    </td>
                    <td className="p-3">{p.signName} ({p.signSanskrit})</td>
                    <td className="p-3">{p.formattedPosition}</td>
                    <td className="p-3">{p.nakshatra.name} ({p.pada})</td>
                    <td className="p-3">House {info?.house || 1}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {info?.isExalted && (
                          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                            Exalted
                          </span>
                        )}
                        {info?.isDebilitated && (
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                            Debilitated
                          </span>
                        )}
                        {info?.isOwnSign && (
                          <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
                            Own Sign
                          </span>
                        )}
                        {info?.isRetrograde && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                            Retrograde
                          </span>
                        )}
                        {info?.isCombust && (
                          <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-orange-400">
                            Combust
                          </span>
                        )}
                        {!info?.isExalted && !info?.isDebilitated && !info?.isOwnSign && !info?.isRetrograde && !info?.isCombust && (
                          <span className="text-muted-foreground">Neutral</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Yogas & Doshas */}
      {activeTab === "yogas" && (
        <div className="space-y-6">
          {/* Key Doshas */}
          <div>
            <h3 className="font-display text-lg mb-3 flex items-center gap-2">
              <ShieldAlert className="size-4 text-amber-400" />
              Dosha Analysis
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Manglik (Kuja) Dosha</p>
                <p className="mt-1 font-semibold text-foreground">
                  {analysis.doshas.isManglik ? `Present (${analysis.doshas.manglikSeverity})` : "Not Present"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {analysis.doshas.manglikDetails}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Kalsarpa Yoga</p>
                <p className="mt-1 font-semibold text-foreground">
                  {analysis.doshas.hasKalsarpa ? "Present" : "Not Present"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {analysis.doshas.kalsarpaType || "Planets are freely distributed across the chart."}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary/30 p-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold">Saturn Sade Sati</p>
                <p className="mt-1 font-semibold text-foreground">
                  {analysis.doshas.sadeSatiStatus.phase}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {analysis.doshas.sadeSatiStatus.details}
                </p>
              </div>
            </div>
          </div>

          {/* Planetary Yogas */}
          <div>
            <h3 className="font-display text-lg mb-3 flex items-center gap-2">
              <Star className="size-4 text-[var(--gold)]" />
              Active Astrological Yogas
            </h3>
            {analysis.yogas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Standard planetary placements without major primary yogas.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.yogas.map((yoga) => (
                  <div key={yoga.name} className="rounded-2xl border border-border bg-secondary/30 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm">{yoga.name} ({yoga.sanskrit})</p>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                        {yoga.category}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{yoga.description}</p>
                    <p className="mt-2 text-[11px] text-[var(--gold)] font-medium">
                      Planets: {yoga.planetsInvolved.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: 120-Year Vimshottari Timeline Scrubber */}
      {activeTab === "timeline" && (
        <div className="pt-2">
          <DashaTimelineScrubber
            mahadashas={dasha.mahadashas}
            birthDateString={chart.birthUtcIso || new Date().toISOString()}
          />
        </div>
      )}

      {/* Tab: Real-time Gochara Transits */}
      {activeTab === "transits" && (
        <div className="pt-2">
          <GocharaTransitViewer natalChart={chart} />
        </div>
      )}
    </section>
  );
}
