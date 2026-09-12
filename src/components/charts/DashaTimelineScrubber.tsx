"use client";

import React, { useState, useMemo } from "react";
import { ChevronRight, Clock, Compass, Sparkles, Zap } from "lucide-react";
import type { MahadashaInfo } from "@/lib/vedic/dasha";
import { DASHA_THEMES, getDashaAtDate } from "@/lib/vedic/dasha";
import { PLANET_DIGNITIES } from "@/lib/vedic/constants";

interface Props {
  mahadashas: MahadashaInfo[];
  birthDateString: string;
}

export function DashaTimelineScrubber({ mahadashas, birthDateString }: Props) {
  const birthDate = useMemo(() => new Date(birthDateString), [birthDateString]);
  const birthYear = birthDate.getFullYear();
  const currentYear = new Date().getFullYear();

  const { minYear, maxYear } = useMemo(() => {
    if (!mahadashas.length) return { minYear: birthYear, maxYear: birthYear + 100 };
    const first = new Date(mahadashas[0]!.startDate).getFullYear();
    const last = new Date(mahadashas[mahadashas.length - 1]!.endDate).getFullYear();
    return { minYear: first, maxYear: last };
  }, [mahadashas, birthYear]);

  const [selectedYear, setSelectedYear] = useState<number>(() =>
    Math.min(Math.max(currentYear, minYear), maxYear)
  );

  const [expandedMaha, setExpandedMaha] = useState<string | null>(null);

  const targetDate = useMemo(() => new Date(selectedYear, 6, 1), [selectedYear]);
  const activePeriod = useMemo(
    () => getDashaAtDate(mahadashas, targetDate),
    [mahadashas, targetDate]
  );

  const userAge = selectedYear - birthYear;
  const theme = activePeriod ? DASHA_THEMES[activePeriod.mahadasha.lord] : null;
  const glyph = activePeriod ? PLANET_DIGNITIES[activePeriod.mahadasha.lord]?.glyph : "✦";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--gold)]">
            <Sparkles className="size-3.5" />
            120-Year Vimshottari Life Timeline
          </span>
          <h3 className="font-display text-xl sm:text-2xl mt-1 text-foreground">
            Planetary Period Explorer
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Scrub through your life journey to discover which cosmic frequencies govern each phase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedYear(birthYear)}
            className="rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            Birth ({birthYear})
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear(currentYear)}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
              selectedYear === currentYear
                ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            Now ({currentYear} · Age {currentYear - birthYear})
          </button>
          <button
            type="button"
            onClick={() => setSelectedYear(Math.min(maxYear, selectedYear + 10))}
            className="rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            +10 Years
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-secondary/20 p-5 sm:p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Birth: {minYear}</span>
          <div className="text-center">
            <span className="font-display text-2xl font-bold sm:text-3xl text-[var(--gold)]">
              {selectedYear}
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {userAge <= 0 ? "Birth Period" : `Age ${userAge}`}
            </span>
          </div>
          <span>Horizon: {maxYear}</span>
        </div>

        <div className="relative py-2">
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-[var(--gold)] focus:outline-none"
          />
        </div>

        <div className="hidden sm:flex h-3 w-full overflow-hidden rounded-full border border-border/80 bg-background/50">
          {mahadashas.map((md) => {
            const startY = new Date(md.startDate).getFullYear();
            const endY = new Date(md.endDate).getFullYear();
            const span = Math.max(1, endY - startY);
            const totalSpan = maxYear - minYear;
            const widthPct = (span / totalSpan) * 100;
            const isCurrent = selectedYear >= startY && selectedYear <= endY;

            return (
              <div
                key={md.lord}
                title={`${md.lord} Mahadasha (${startY} - ${endY})`}
                onClick={() => setSelectedYear(Math.round((startY + endY) / 2))}
                style={{ width: `${widthPct}%` }}
                className={`h-full cursor-pointer border-r border-background/40 transition-all ${
                  isCurrent
                    ? "bg-[var(--gold)] shadow-md"
                    : "bg-primary/20 hover:bg-primary/40"
                }`}
              />
            );
          })}
        </div>

        {activePeriod && (
          <div className="mt-4 rounded-xl border border-[var(--gold)]/30 bg-gradient-to-br from-background/90 via-secondary/30 to-background/90 p-4 sm:p-5 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-2xl text-[var(--gold)] border border-[var(--gold)]/20 shadow-sm">
                  {glyph}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-lg font-bold text-foreground">
                      {activePeriod.mahadasha.lord} Mahadasha
                    </h4>
                    <span className="rounded-md bg-[var(--gold)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--gold)]">
                      {theme?.archetype}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Spans {new Date(activePeriod.mahadasha.startDate).getFullYear()} –{" "}
                    {new Date(activePeriod.mahadasha.endDate).getFullYear()} ({activePeriod.mahadasha.durationYears} Years)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="rounded-lg bg-background/80 px-2.5 py-1 border border-border">
                  Antardasha: <strong className="text-foreground">{activePeriod.antardasha.subLord}</strong>
                </span>
                <ChevronRight className="size-3 text-muted-foreground" />
                <span className="rounded-lg bg-background/80 px-2.5 py-1 border border-border">
                  Pratyantar: <strong className="text-primary">{activePeriod.pratyantardashaLord}</strong>
                </span>
              </div>
            </div>

            {theme && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
                <div className="rounded-lg bg-secondary/30 p-2.5 border border-border/40">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Compass className="size-3 text-primary" /> Core Focus
                  </span>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    {theme.focus}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 border border-border/40">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Zap className="size-3" /> Life Opportunity
                  </span>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    {theme.opportunity}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 border border-border/40">
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    <Clock className="size-3" /> Watch & Cultivate
                  </span>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    {theme.caution}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Complete 120-Year Mahadasha Sequence
        </h4>
        <div className="grid gap-2">
          {mahadashas.map((md, idx) => {
            const startYear = new Date(md.startDate).getFullYear();
            const endYear = new Date(md.endDate).getFullYear();
            const isSelected = activePeriod?.mahadasha.lord === md.lord;
            const isExpanded = expandedMaha === md.lord;
            const pTheme = DASHA_THEMES[md.lord];

            return (
              <div
                key={md.lord}
                className={`rounded-xl border transition-all ${
                  isSelected
                    ? "border-[var(--gold)]/40 bg-[var(--gold)]/5 shadow-sm"
                    : "border-border/60 bg-secondary/15 hover:border-border"
                }`}
              >
                <div
                  className="flex items-center justify-between p-3.5 cursor-pointer"
                  onClick={() => setExpandedMaha(isExpanded ? null : md.lord)}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-background/80 text-xs font-bold text-foreground border border-border">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-medium text-sm text-foreground mr-2">
                        {md.lord} Mahadasha
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {pTheme?.archetype} · {startYear} to {endYear} ({md.durationYears} yrs)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedYear(Math.round((startYear + endYear) / 2));
                      }}
                      className="text-[11px] text-[var(--gold)] hover:underline mr-2"
                    >
                      Scrub here
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/50 bg-background/40 p-3.5">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      9 Antardasha Periods within {md.lord}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {md.antardashas.map((ad) => {
                        const adStart = new Date(ad.startDate).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        });
                        const adEnd = new Date(ad.endDate).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        });
                        const isSubActive =
                          activePeriod?.antardasha.subLord === ad.subLord &&
                          activePeriod.mahadasha.lord === md.lord;

                        return (
                          <div
                            key={ad.subLord}
                            className={`rounded-lg p-2 border ${
                              isSubActive
                                ? "border-primary bg-primary/15 text-primary-foreground font-medium"
                                : "border-border/50 bg-secondary/20 text-muted-foreground"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-foreground">
                                {md.lord} - {ad.subLord}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {ad.durationMonths} mo
                              </span>
                            </div>
                            <span className="text-[10px] block mt-0.5">
                              {adStart} – {adEnd}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
