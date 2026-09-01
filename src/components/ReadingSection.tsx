import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, type LucideIcon } from "lucide-react";

interface Props {
  index: number;
  title: string;
  icon: LucideIcon;
  content: string;
  defaultOpen?: boolean;
}

export function ReadingSection({ index, title, icon: Icon, content, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const id = `section-${index}`;

  if (!content) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
      className="glass-panel print-plain overflow-hidden rounded-2xl"
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
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary"
            aria-hidden="true"
          >
            <Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {String(index).padStart(2, "0")}
            </span>
            <span className="block truncate font-display text-lg sm:text-xl">{title}</span>
          </span>
          <ChevronDown
            className={`size-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""} no-print`}
            aria-hidden="true"
          />
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
            <div className="space-y-4 px-5 pb-6 text-sm leading-relaxed text-muted-foreground sm:px-7 sm:text-[15px]">
              {content.split(/\n{1,2}/).map((para, i) =>
                para.trim() ? (
                  <p key={i} className="print-plain">
                    {para.trim()}
                  </p>
                ) : null,
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Always-visible copy for printing */}
      <div className="hidden print:block print-plain px-7 pb-6 text-sm">
        {content.split(/\n{1,2}/).map((para, i) =>
          para.trim() ? (
            <p key={i} className="mb-2">
              {para.trim()}
            </p>
          ) : null,
        )}
      </div>
    </motion.section>
  );
}
