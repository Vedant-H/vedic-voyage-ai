"use client";

import React, { useState } from "react";
import type { CompleteVedicChart } from "@/lib/vedic";

interface Props {
  chart: CompleteVedicChart;
  className?: string;
}

/**
 * Classical North Indian (Diamond) Janma Kundli Chart.
 * In the North Indian style:
 * - Houses are geometrically FIXED: House 1 is always the top-center diamond.
 * - The number printed in each house represents the Zodiac Sign (1=Aries, 2=Taurus... 12=Pisces).
 * - Planets are rendered inside their respective houses with degrees & status tags.
 */
export function NorthIndianChart({ chart, className = "" }: Props) {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  const houses = chart.houses;
  const analysis = chart.analysis.planets;

  // Geometry definitions for 12 houses on a 400x400 SVG canvas:
  // Center is (200, 200). Outer boundary is (0,0) to (400,400).
  // Diagonals from corners: (0,0)-(400,400) and (0,400)-(400,0).
  // Inner diamond: (200,0), (0,200), (200,400), (400,200).
  const houseLayouts = [
    // House 1 (Top Center Diamond)
    { num: 1, textPos: { x: 200, y: 110 }, signPos: { x: 200, y: 155 } },
    // House 2 (Top-Left Triangle)
    { num: 2, textPos: { x: 100, y: 55 }, signPos: { x: 175, y: 80 } },
    // House 3 (Left-Upper Triangle)
    { num: 3, textPos: { x: 50, y: 105 }, signPos: { x: 80, y: 175 } },
    // House 4 (Left Center Diamond)
    { num: 4, textPos: { x: 110, y: 200 }, signPos: { x: 155, y: 200 } },
    // House 5 (Left-Lower Triangle)
    { num: 5, textPos: { x: 50, y: 295 }, signPos: { x: 80, y: 225 } },
    // House 6 (Bottom-Left Triangle)
    { num: 6, textPos: { x: 100, y: 345 }, signPos: { x: 175, y: 320 } },
    // House 7 (Bottom Center Diamond)
    { num: 7, textPos: { x: 200, y: 290 }, signPos: { x: 200, y: 245 } },
    // House 8 (Bottom-Right Triangle)
    { num: 8, textPos: { x: 300, y: 345 }, signPos: { x: 225, y: 320 } },
    // House 9 (Right-Lower Triangle)
    { num: 9, textPos: { x: 350, y: 295 }, signPos: { x: 320, y: 225 } },
    // House 10 (Right Center Diamond)
    { num: 10, textPos: { x: 290, y: 200 }, signPos: { x: 245, y: 200 } },
    // House 11 (Right-Upper Triangle)
    { num: 11, textPos: { x: 350, y: 105 }, signPos: { x: 320, y: 175 } },
    // House 12 (Top-Right Triangle)
    { num: 12, textPos: { x: 300, y: 55 }, signPos: { x: 225, y: 80 } },
  ];

  return (
    <div className={`relative mx-auto w-full max-w-md select-none ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-auto drop-shadow-2xl rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md"
      >
        <defs>
          <linearGradient id="kundliLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.83 0.11 86 / 60%)" />
            <stop offset="50%" stopColor="oklch(0.68 0.16 288 / 60%)" />
            <stop offset="100%" stopColor="oklch(0.83 0.11 86 / 60%)" />
          </linearGradient>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.68 0.16 288 / 15%)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width="400" height="400" fill="url(#centerGlow)" rx="16" />

        {/* Outer Square */}
        <rect
          x="1"
          y="1"
          width="398"
          height="398"
          fill="none"
          stroke="url(#kundliLineGrad)"
          strokeWidth="1.5"
          rx="16"
        />

        {/* Diagonal Cross Lines */}
        <line x1="0" y1="0" x2="400" y2="400" stroke="url(#kundliLineGrad)" strokeWidth="1.2" />
        <line x1="0" y1="400" x2="400" y2="0" stroke="url(#kundliLineGrad)" strokeWidth="1.2" />

        {/* Inner Diamond Lines */}
        <polygon
          points="200,0 400,200 200,400 0,200"
          fill="none"
          stroke="url(#kundliLineGrad)"
          strokeWidth="1.5"
        />

        {/* Render Houses, Sign Numbers, and Planets */}
        {houseLayouts.map((layout) => {
          const house = houses[layout.num - 1];
          if (!house) return null;

          const planetsInHouse = house.planets;
          const isLagna = layout.num === 1;

          return (
            <g key={layout.num}>
              {/* Sign Number (Zodiac Rashi ID: 1-12) */}
              <text
                x={layout.signPos.x}
                y={layout.signPos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-[var(--gold)]/80 text-[11px] font-semibold tracking-wider"
              >
                {house.signId}
              </text>

              {/* Lagna indicator on 1st house */}
              {isLagna && (
                <text
                  x={layout.textPos.x}
                  y={layout.textPos.y - 30}
                  textAnchor="middle"
                  className="fill-[var(--primary)] text-[10px] uppercase font-bold tracking-widest"
                >
                  Asc (Lagna)
                </text>
              )}

              {/* Planets in this house */}
              <g>
                {planetsInHouse.map((p, idx) => {
                  const planetInfo = analysis[p.name];
                  const isExalted = planetInfo?.isExalted;
                  const isDebilitated = planetInfo?.isDebilitated;
                  const isRetro = p.isRetrograde;

                  // Vertical offset inside house text position
                  const yOffset = layout.textPos.y - (planetsInHouse.length - 1) * 8 + idx * 16;

                  const colorClass = isExalted
                    ? "fill-emerald-400 font-semibold"
                    : isDebilitated
                    ? "fill-rose-400 font-semibold"
                    : isRetro
                    ? "fill-amber-300 font-semibold"
                    : "fill-foreground";

                  const tag = isExalted ? "(E)" : isDebilitated ? "(D)" : isRetro ? "(R)" : "";

                  return (
                    <text
                      key={p.name}
                      x={layout.textPos.x}
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
