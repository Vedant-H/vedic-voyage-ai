"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { BookmarkPlus, Check, Download, Loader2, RotateCcw, Share2, Sparkles } from "lucide-react";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";
import { createClient } from "@/lib/supabase/client";
import { cleanProse } from "@/lib/utils";
import type { StoredReading } from "@/types/astrology";

const PdfDownloadButton = dynamic(
  () => import("@/components/pdf/PdfDownloadButton").then((mod) => mod.PdfDownloadButton),
  { ssr: false }
);

interface Props {
  stored: StoredReading;
  onRestart: () => void;
}

export function ReadingHeader({ stored, onRestart }: Props) {
  const { birth, reading, generatedAt } = stored;
  const place = [birth.birthCity, birth.birthState, birth.birthCountry].filter(Boolean).join(", ");
  
  const [authOpen, setAuthOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  async function handleSaveToVault() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAuthOpen(true);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: birth.name || "My Chart",
          relationship: "Self",
          date_of_birth: birth.dateOfBirth,
          time_of_birth: birth.timeOfBirth,
          city: place || "Unknown",
          chart_data: stored.vedicChart,
          reading_data: stored.reading,
        }),
      });

      if (res.ok) {
        setSaved(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save to vault");
      }
    } catch (err: any) {
      console.warn("Vault save error:", err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleShare() {
    const name = birth.name || "My Chart";
    const asc = stored.vedicChart?.ascendant?.sign || "Aries";
    const moon = stored.vedicChart?.moonSign || "Taurus";
    const nakshatra = stored.vedicChart?.nakshatra?.name || "Rohini";
    const dasha = stored.vedicChart?.dasha?.currentMahadasha?.planet || "Jupiter";

    const shareUrl = `${window.location.origin}/api/og?name=${encodeURIComponent(
      name
    )}&ascendant=${encodeURIComponent(asc)}&moon=${encodeURIComponent(
      moon
    )}&nakshatra=${encodeURIComponent(nakshatra)}&dasha=${encodeURIComponent(dasha)}`;

    if (navigator.share) {
      navigator
        .share({
          title: `${name}'s Vedic Chart`,
          text: `My Vedic Astrological Blueprint — Lagna: ${asc}, Moon: ${moon}, Dasha: ${dasha}.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Chart preview link copied to clipboard!");
    }
  }

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
        {cleanProse(reading.summary.headline) || "Your cosmic profile"}
      </h1>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {cleanProse(reading.summary.overview)}
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

      <div className="mt-8 flex flex-wrap items-center gap-3 no-print">
        <PdfDownloadButton stored={stored} />

        <Button
          variant={saved ? "secondary" : "default"}
          size="lg"
          onClick={handleSaveToVault}
          disabled={saving}
          className={saved ? "border border-emerald-500/30 text-emerald-400" : ""}
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="size-4 text-emerald-400" aria-hidden="true" />
              Saved in Vault
            </>
          ) : (
            <>
              <BookmarkPlus className="size-4 text-[var(--gold)]" aria-hidden="true" />
              Save to Vault
            </>
          )}
        </Button>

        <Button variant="outline" size="lg" onClick={handleShare}>
          <Share2 className="size-4" aria-hidden="true" />
          Share
        </Button>

        <Button variant="ghost" size="lg" onClick={onRestart}>
          <RotateCcw className="size-4" aria-hidden="true" /> New reading
        </Button>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
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
