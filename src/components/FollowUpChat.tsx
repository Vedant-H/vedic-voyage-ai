import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askGuide } from "@/lib/reading.functions";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What does my chart say about my career this year?",
  "Which strengths should I lean on most?",
  "How can I improve my relationships?",
];

export function FollowUpChat({ context }: { context: string }) {
  const ask = useServerFn(askGuide);
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  async function send(question: string) {
    const trimmed = question.trim();
    if (trimmed.length < 2 || busy) return;
    setError("");
    setValue("");
    const history = messages.slice(-6);
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setBusy(true);
    try {
      const res = await ask({ data: { question: trimmed, context, history } });
      setMessages((m) => [...m, { role: "assistant", content: res.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8 no-print">
      <h2 className="flex items-center gap-3 font-display text-2xl">
        <span
          className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary"
          aria-hidden="true"
        >
          <MessageCircle className="size-5" />
        </span>
        Ask about your reading
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Follow-up questions are answered using the reading above.
      </p>

      {messages.length === 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border bg-secondary/40 px-4 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-4" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary/20 text-foreground"
                    : "border border-border bg-secondary/40 text-muted-foreground"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {busy && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Consulting your chart…
          </p>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask a question about your reading…"
          aria-label="Your question"
          maxLength={600}
        />
        <Button type="submit" disabled={busy || value.trim().length < 2}>
          <Send className="size-4" aria-hidden="true" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </section>
  );
}
