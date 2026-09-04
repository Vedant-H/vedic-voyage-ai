import { motion } from "motion/react";

const planets = [
  { r: 78, size: 7, duration: 26, color: "var(--gold)" },
  { r: 118, size: 5, duration: 38, color: "var(--primary)" },
  { r: 158, size: 9, duration: 52, color: "var(--nebula)" },
  { r: 198, size: 4, duration: 68, color: "oklch(0.8 0.08 220)" },
];

const constellation: Array<[number, number]> = [
  [30, 46],
  [72, 28],
  [118, 58],
  [166, 34],
  [206, 74],
];

/** Decorative animated cosmic chart used in the hero and loading screen. */
export function CosmicChart({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square w-full ${className}`} aria-hidden="true">
      <div className="starfield absolute inset-0 rounded-full opacity-70" />
      <motion.div
        className="absolute inset-[18%] rounded-full blur-3xl"
        style={{ background: "var(--gradient-halo)", opacity: 0.18 }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.14, 0.24, 0.14] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 480 480" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="core" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.95 0.05 90)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="oklch(0.6 0.16 292)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {[78, 118, 158, 198, 226].map((r, i) => (
          <circle
            key={r}
            cx="240"
            cy="240"
            r={r}
            fill="none"
            stroke="oklch(1 0 0 / 12%)"
            strokeWidth={i === 4 ? 0.6 : 1}
            strokeDasharray={i % 2 ? "3 8" : undefined}
          />
        ))}

        {/* Twelve-house divisions */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={240 + Math.cos(a) * 198}
              y1={240 + Math.sin(a) * 198}
              x2={240 + Math.cos(a) * 226}
              y2={240 + Math.sin(a) * 226}
              stroke="oklch(0.83 0.11 86 / 45%)"
              strokeWidth="1"
            />
          );
        })}

        <motion.polyline
          points={constellation.map(([x, y]) => `${x + 130},${y + 150}`).join(" ")}
          fill="none"
          stroke="oklch(0.83 0.11 86 / 55%)"
          strokeWidth="0.8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        />
        {constellation.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x + 130}
            cy={y + 150}
            r="2.4"
            fill="oklch(0.95 0.06 90)"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <circle cx="240" cy="240" r="70" fill="url(#core)" />
      </svg>

      {planets.map((p, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${((240 + p.r) / 480) * 100}%`,
              width: p.size,
              height: p.size,
              marginLeft: -p.size / 2,
              background: p.color,
              boxShadow: `0 0 14px 2px ${p.color}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
