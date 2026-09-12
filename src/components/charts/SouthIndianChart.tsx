"use client";

import React, { useState } from "react";
import type { CompleteVedicChart } from "@/lib/vedic";

interface Props {
  chart: CompleteVedicChart;
  className?: string;
}

/**
 * Classical South Indian (Box) Janma Kundli Chart.
 * In the South Indian style:
 * - Zodiac signs are geometrically FIXED in clockwise order:
 *   Pisces, Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius.
 * - The Ascendant (Lagna) is marked with "ASC / Lagna" in its sign box.
 * - Planets are rendered inside the box corresponding to their sidereal sign.
 */
export function SouthIndianChart({ chart, className = "" }: Props) {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const analysis = chart.analysis.planets;
  const lagnaSignId = chart.ascendant.signId;

  // 12 sign boxes mapped to 4x4 grid (row, col):
  // 1=Aries (row 0, col 1)
  // 2=Taurus (row 0, col 2)
  // 3=Gemini (row 0, col 3)
  // 4=Cancer (row 1, col 3)
  // 5=Leo (row 2, col 3)
  // 6=Virgo (row 3, col 3)
  // 7=Libra (row 3, col 2)
  // 8=Scorpio (row 3, col 1)
  // 9=Sagittarius (row 3, col 0)
  // 10=Capricorn (row 2, col 0)
  // 11=Aquarius (row 1, col 0)
  // 12=Pisces (row 0, col 0)
  const signGridMapping: Record<number, { r: number; c: number; name: string; short: string }> = {
    1: { r: 0, c: 1, name: "Aries", short: "Ari" },
    2: { r: 0, c: 2, name: "Taurus", short: "Tau" },
    3: { r: 0, c: 3, name: "Gemini", short: "Gem" },
    4: { r: 1, c: 3, name: "Cancer", short: "Can" },
    5: { r: 2, c: 3, name: "Leo", short: "Leo" },
    6: { r: 3, c: 3, name: "Virgo", short: "Vir" },
    7: { r: 3, c: 2, name: "Libra", short: "Lib" },
    8: { r: 3, c: 1, name: "Scorpio", short: "Sco" },
    9: { r: 3, c: 0, name: "Sagittarius", short: "Sag" },
    10: { r: 2, c: 0, name: "Capricorn", short: "Cap" },
    11: { r: 1, c: 0, name: "Aquarius", short: "Aqu" },
    12: { r: 0, c: 0, name: "Pisces", short: "Pis" },
  };

  // Group planets by signId
  const planetsBySign: Record<number, typeof chart.planets[string][]> = {};
  for (let s = 1; s <= 12; s++) planetsBySign[s] = [];
  for (const p of Object.values(chart.planets)) {
    planetsBySign[p.signId]?.push(p);
  }

  const cellSize = 100; // 400x400 total

  return (
    <div className={`relative mx-auto w-full max-w-md select-none ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto drop-shadow-2xl rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md"
      >
        <defs>
          <linearGradient id="southKundliGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.83 0.11 86 / 60%)" />
            <stop offset="100%" stopColor="oklch(0.68 0.16 288 / 60%)" />
          </linearGradient>
        </defs>

        {/* Outer Frame */}
        <rect
          x="1"
          y="1"
          width="398"
          height="398"
          fill="none"
          stroke="url(#southKundliGrad)"
          strokeWidth="1.5"
          rx="16"
        />

        {/* Grid lines: 4x4 outer rows/cols */}
        <line x1="100" y1="0" x2="100" y2="400" stroke="url(#southKundliGrad)" strokeWidth="1" />
        <line x1="200" y1="0" x2="200" y2="100" stroke="url(#southKundliGrad)" strokeWidth="1" />
        <line x1="200" y1="300" x2="200" y2="400" stroke="url(#southKundliGrad)" strokeWidth="1" />
        <line x1="300" y1="0" x2="300" y2="400" stroke="url(#southKundliGrad)" strokeWidth="1" />

        <line x1="0" y1="100" x2="400" y2="100" stroke="url(#southKundliGrad)" strokeWidth="1" />
        <line x1="0" y1="200" x2="100" y2="200" stroke="url(#southKundliGrad)" strokeWidth="1" />
        <line x1="300" y1="200" x2="400" y2="200" stroke="url(#southKundliGrad)" strokeWidth="1" />
        <line x1="0" y1="300" x2="400" y2="300" stroke="url(#southKundliGrad)" strokeWidth="1" />

        {/* Center Box Label */}
        <g>
          <text
            x="200"
            y="190"
            textAnchor="middle"
            className="fill-[var(--gold)] text-sm font-display font-semibold tracking-wider"
          >
            Rashi Chart
          </text>
          <text
            x="200"
            y="215"
            textAnchor="middle"
            className="fill-muted-foreground text-[10px] tracking-wide uppercase"
          >
            Lahiri Ayanamsha
          </text>
        </g>

        {/* Render 12 Sign Boxes */}
        {Object.entries(signGridMapping).map(([signIdStr, info]) => {
          const signId = parseInt(signIdStr, 10);
          const x = info.c * cellSize;
          const y = info.r * cellSize;
          const isLagna = signId === lagnaSignId;
          const planetsInThisSign = planetsBySign[signId] || [];

          return (
            <g key={signId}>
              {/* Sign label in corner */}
              <text
                x={x + 6}
                y={y + 14}
                className="fill-muted-foreground/60 text-[9px] uppercase tracking-wider font-semibold"
              >
                {info.short}
              </text>

              {/* Ascendant Marker */}
              {isLagna && (
                <text
                  x={x + cellSize - 6}
                  y={y + 14}
                  textAnchor="end"
                  className="fill-[var(--primary)] text-[10px] font-bold tracking-wider"
                >
                  ASC
                </text>
              )}

              {/* Planets */}
              <g>
                {planetsInThisSign.map((p, pIdx) => {
                  const planetInfo = analysis[p.name];
                  const isExalted = planetInfo?.isExalted;
                  const isDebilitated = planetInfo?.isDebilitated;
                  const isRetro = p.isRetrograde;

                  const colorClass = isExalted
                    ? "fill-emerald-400 font-semibold"
                    : isDebilitated
                    ? "fill-rose-400 font-semibold"
                    : isRetro
                    ? "fill-amber-300 font-semibold"
                    : "fill-foreground";

                  const tag = isExalted ? "(E)" : isDebilitated ? "(D)" : isRetro ? "(R)" : "";
                  const yOffset = y + 32 + pIdx * 15;

                  return (
                    <text
                      key={p.name}
                      x={x + cellSize / 2}
                      y={yOffset}
                      textAnchor="middle"
                      dominantBaseline="central"
                      onMouseEnter={() => setHoveredPlanet(p.name)}
                      onMouseLeave={() => setHoveredPlanet(null)}
                      className={`cursor-pointer transition-opacity text-[11px] hover:opacity-80 ${colorClass}`}
                    >
                      {p.glyph} {p.name.slice(0, 2)} {Math.floor(p.degreeInSign)}° {tag}
                    </text>
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>

      {/* Hover Info Tooltip */}
      {hoveredPlanet && analysis[hoveredPlanet] && (
        <div className="mt-3 rounded-xl border border-border bg-secondary/80 p-3 text-xs leading-relaxed backdrop-blur-md">
          <p className="font-semibold text-foreground">
            {hoveredPlanet} ({chart.planets[hoveredPlanet]?.glyph}):{" "}
            <span className="font-normal text-muted-foreground">
              {analysis[hoveredPlanet]?.summaryDescription}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Nakshatra:{" "}
            <span className="text-foreground">
              {chart.planets[hoveredPlanet]?.nakshatra.name} (Pada {chart.planets[hoveredPlanet]?.pada})
            </span>{" "}
            · Speed: {chart.planets[hoveredPlanet]?.speed.toFixed(2)}°/day
          </p>
        </div>
      )}
    </div>
  );
}
