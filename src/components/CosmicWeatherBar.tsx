"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Compass, Heart, Orbit, ShieldAlert, Sparkles, Star } from "lucide-react";
import type { CompleteVedicChart } from "@/lib/vedic";
import { calculateGocharaTransits } from "@/lib/vedic/transits";
import { Button } from "@/components/ui/button";

interface Props {
  chart: CompleteVedicChart;
}

export function CosmicWeatherBar({ chart }: Props) {
  const transits = useMemo(() => calculateGocharaTransits(chart), [chart]);
  const currentDasha = chart.dasha.current;
  const sadeSati = transits.specialEvents.sadeSati;
  const jupiter = transits.specialEvents.jupiterTransit;

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-r from-background/90 via-secondary/30 to-background/90 p-4 sm:p-5 shadow-lg backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Key Astrological Status Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--gold)]/15 text-[var(--gold)]">
              <Orbit className="size-4 animate-spin" style={{ animationDuration: "16s" }} />
            </span>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Live Cosmic Weather
              </span>
              <span className="font-semibold text-foreground">
                {currentDasha ? `${currentDasha.mahadasha} - ${currentDasha.antardasha} Dasha` : "Active Dasha"}
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-border/80" />

          {/* Sade Sati Indicator */}
          <div className="flex items-center gap-2 rounded-xl bg-background/60 px-3 py-1.5 border border-border/60">
            <span
              className={`size-2 rounded-full ${
                sadeSati.active ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                Saturn Transit
              </span>
              <span className="font-medium text-foreground text-[11px]">
                {sadeSati.active ? `Sade Sati (${sadeSati.phase})` : "Sade Sati Inactive"}
              </span>
            </div>
          </div>

          {/* Jupiter Transit Indicator */}
          <div className="hidden lg:flex items-center gap-2 rounded-xl bg-background/60 px-3 py-1.5 border border-border/60">
            <span className="text-[var(--gold)]">♃</span>
            <div>
              <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-medium">
                Jupiter Transit
              </span>
              <span className="font-medium text-foreground text-[11px]">
                House {jupiter.houseFromMoon} from Moon ({jupiter.isFavorable ? "Favorable" : "Reflective"})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            size="sm"
            variant="outline"
            asChild
            className="h-8 text-xs border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/10"
          >
            <Link href="/milan">
              <Heart className="size-3.5 mr-1.5 fill-[var(--gold)]" />
              Match Partner (Kundli Milan)
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
