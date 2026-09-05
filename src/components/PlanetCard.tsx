import { motion } from "motion/react";

import type { PlanetaryInsight } from "@/types/astrology";

export function PlanetCard({ insight, index }: { insight: PlanetaryInsight; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="glass-panel print-plain relative w-[80vw] max-w-xs shrink-0 snap-start overflow-hidden rounded-2xl p-6 sm:w-72 print:w-full"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full blur-2xl no-print"
        style={{ background: "var(--gradient-halo)", opacity: 0.18 }}
        aria-hidden="true"
      />
      <div
        className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary/50 font-display text-2xl text-[var(--gold)]"
        aria-hidden="true"
      >
        {[...(insight.symbol ?? "")].length <= 2 && insight.symbol ? insight.symbol : "✷"}
      </div>

      <h4 className="mt-4 font-display text-xl">{insight.planet}</h4>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{insight.interpretation}</p>
    </motion.article>
  );
}
