"use client";

import React from "react";
import { Crown, Lock, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onUnlockClick: () => void;
}

export function PremiumPaywallBanner({ onUnlockClick }: Props) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--gold)]/40 bg-gradient-to-b from-background/90 via-[#181324]/90 to-background/90 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
      {/* Halo glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full blur-3xl opacity-20"
        style={{ background: "var(--gradient-halo)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 shadow-inner mb-4">
          <Lock className="size-6 text-[var(--gold)]" />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1 text-xs text-[var(--gold)] font-medium mb-3">
          <Crown className="size-3.5" />
          <span>Sacred Deep Chapters</span>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Unlock the Full 15-Page Cosmic Dossier
        </h3>

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Access your comprehensive 12-House Parashari analysis, 120-Year Vimshottari Mahadasha timeline, classical BPHS remedies (Mantras & Gemstones), high-resolution PDF download, and unlimited AI consultations.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
          <Button
            size="lg"
            className="bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-semibold px-8 py-6 text-base shadow-xl"
            onClick={onUnlockClick}
          >
            <Sparkles className="size-4 mr-2" />
            Unlock Complete Reading · ₹1,499 / $19
          </Button>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          One-time payment · Instant lifetime access · Encrypted in Cosmic Vault
        </p>
      </div>
    </div>
  );
}
