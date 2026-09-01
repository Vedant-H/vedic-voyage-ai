import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, Loader2 } from "lucide-react";

import { CosmicChart } from "./CosmicChart";

const STAGES = [
  "Reading birth information",
  "Mapping planetary influences",
  "Examining houses and life areas",
  "Exploring Nakshatra patterns",
  "Analyzing current planetary periods",
  "Generating your personalized reading",
];

export function LoadingAnalysis({ done = false }: { done?: boolean }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= STAGES.length - 1) return;
    const delay = done ? 320 : 1400 + stage * 250;
    const timer = setTimeout(() => setStage((s) => s + 1), delay);
    return () => clearTimeout(timer);
  }, [stage, done]);

  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col items-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <CosmicChart className="mx-auto max-w-lg" />
      </div>

      <h2 className="text-center text-2xl font-semibold sm:text-3xl">
        Composing your cosmic profile
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        This usually takes under a minute.
      </p>

      <ol className="glass-panel mt-10 w-full space-y-1 rounded-2xl p-4 sm:p-6">
        {STAGES.map((label, i) => {
          const complete = i < stage;
          const active = i === stage;
          return (
            <motion.li
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: active || complete ? 1 : 0.35, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl px-3 py-3"
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                  complete
                    ? "border-primary/60 bg-primary/20 text-primary"
                    : "border-border text-muted-foreground"
                }`}
                aria-hidden="true"
              >
                {complete ? (
                  <Check className="size-3.5" />
                ) : active ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                )}
              </span>
              <span className={`text-sm ${complete || active ? "" : "text-muted-foreground"}`}>
                {label}
              </span>
            </motion.li>
          );
        })}
      </ol>

      <p aria-live="polite" className="sr-only">
        {STAGES[Math.min(stage, STAGES.length - 1)]}
      </p>
    </div>
  );
}
