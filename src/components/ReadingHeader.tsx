import { motion } from "motion/react";
import { Download, RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StoredReading } from "@/types/astrology";

interface Props {
  stored: StoredReading;
  onRestart: () => void;
}

export function ReadingHeader({ stored, onRestart }: Props) {
  const { birth, reading, generatedAt } = stored;
  const place = [birth.birthCity, birth.birthState, birth.birthCountry].filter(Boolean).join(", ");

  return (
    <motion.header
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel print-plain relative overflow-hidden rounded-3xl p-6 sm:p-10"
    >
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full blur-3xl no-print"
        style={{ background: "var(--gradient-halo)", opacity: 0.16 }}
        aria-hidden="true"
      />

      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        <Sparkles className="size-3.5 text-[var(--gold)]" aria-hidden="true" />
        Your reading
      </p>

      <h1 className="mt-4 font-display text-3xl leading-tight sm:text-5xl">
        {birth.name ? `${birth.name}, ` : ""}
        {reading.summary.headline || "Your cosmic profile"}
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {reading.summary.overview}
      </p>

      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-3">
        <Meta label="Born" value={`${birth.dateOfBirth} · ${birth.timeOfBirth}`} />
        <Meta label="Birth place" value={place || "—"} />
        <Meta
          label="Generated"
          value={new Date(generatedAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        />
      </dl>

      <div className="mt-8 flex flex-wrap gap-3 no-print">
        <Button onClick={() => window.print()} size="lg">
          <Download className="size-4" aria-hidden="true" /> Save as PDF
        </Button>
        <Button variant="outline" size="lg" onClick={onRestart}>
          <RotateCcw className="size-4" aria-hidden="true" /> New reading
        </Button>
      </div>
    </motion.header>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3 print-plain">
      <dt className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{value}</dd>
    </div>
  );
}
