"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Crown, Lock, Sparkles, type LucideIcon } from "lucide-react";
import { cleanProse } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  index: number;
  title: string;
  icon: LucideIcon;
  content: string;
  defaultOpen?: boolean;
  isLocked?: boolean;
  onUnlock?: () => void;
}

export function ReadingSection({
  index,
  title,
  icon: Icon,
  content,
  defaultOpen = false,
  isLocked = false,
  onUnlock,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const id = `section-${index}`;
  const sanitizedContent = cleanProse(content);

  if (!sanitizedContent) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
      className={`glass-panel print-plain overflow-hidden rounded-2xl transition-all ${
        isLocked ? "border-border/60 bg-secondary/15" : ""
      }`}
    >
      <h3>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-accent/30 sm:px-7"
        >
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              isLocked
                ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20"
                : "bg-primary/15 text-primary"
            }`}
            aria-hidden="true"
          >
            {isLocked ? <Lock className="size-4" /> : <Icon className="size-5" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {String(index).padStart(2, "0")}
            </span>
            <span className="block truncate font-display text-lg sm:text-xl text-foreground">
              {title}
            </span>
          </span>

          {isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)] no-print">
              <Lock className="size-3" />
              Locked
            </span>
          ) : (
            <ChevronDown
              className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                open ? "rotate-180" : ""
              } no-print`}
              aria-hidden="true"
            />
          )}
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {isLocked ? (
              <div className="relative px-5 pb-6 sm:px-7">
                {/* Teaser text (first sentence) */}
                <p className="text-sm leading-relaxed text-muted-foreground/80 mb-3 line-clamp-2">
                  {sanitizedContent.split(".")[0]}.
                </p>

                {/* Blurred teaser overlay */}
                <div className="relative overflow-hidden rounded-xl border border-[var(--gold)]/30 bg-gradient-to-b from-[var(--gold)]/5 via-background/90 to-background/95 p-6 text-center backdrop-blur-md">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30 mb-2.5">
                    <Crown className="size-5" />
                  </div>
                  <h4 className="font-display text-base sm:text-lg font-semibold text-foreground">
                    Deep Chapter Locked
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                    Unlock complete 12-house Vedic analysis, 120-year Vimshottari Mahadashas, and classical Parashari remedies.
                  </p>
                  {onUnlock && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnlock();
                      }}
                      className="mt-4 bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90 font-semibold text-xs shadow-md"
                    >
                      <Sparkles className="size-3.5 mr-1.5" />
                      Unlock Full Dossier · ₹1,499
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 px-5 pb-6 text-sm leading-relaxed text-muted-foreground sm:px-7 sm:text-[15px]">
                {sanitizedContent.split(/\n{1,2}/).map((para, i) =>
                  para.trim() ? (
                    <p key={i} className="print-plain">
                      {para.trim()}
                    </p>
                  ) : null
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible copy for printing (only if unlocked) */}
      {!isLocked && (
        <div className="hidden print:block print-plain px-7 pb-6 text-sm">
          {sanitizedContent.split(/\n{1,2}/).map((para, i) =>
            para.trim() ? (
              <p key={i} className="mb-2">
                {para.trim()}
              </p>
            ) : null
          )}
        </div>
      )}
    </motion.section>
  );
}
