"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HeartHandshake,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Phone,
  Send,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cleanProse } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
  isCrisis?: boolean;
  crisisResources?: Array<{ name: string; phone: string }>;
}

const SUGGESTIONS = [
  "What does my chart say about my career this year?",
  "Which strengths should I lean on most?",
  "How can I improve my relationships?",
];

function normalizeChatContent(content: string) {
  let text = cleanProse(content);

  // unwrap common JSON object wrappers from chat APIs that emit a nested payload key
  if (text.startsWith("{") && text.includes("\"response\"") && text.includes("\"answer\"")) {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      if (typeof parsed.response === "string") {
        text = parsed.response;
      } else if (typeof parsed.answer === "string") {
        text = parsed.answer;
      }
    } catch {
      // fall through to plain text cleanup below
    }
  }

  // normalize markdown-like tokens into a clean plain-text slice
  text = cleanProse(text)
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/```/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

export function FollowUpChat({ context }: { context: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) {
            setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Speech recognition error:", err);
      }
    }
  }

  function handleSpeak(text: string, index: number) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, "").slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  }

  async function send(question: string) {
    const trimmed = question.trim();
    if (trimmed.length < 2 || busy) return;
    setError("");
    setValue("");
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, context, history }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to get answer");
      }

      const answer = normalizeChatContent(data.answer || "");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: answer,
          isCrisis: data.isCrisis,
          crisisResources: data.crisisResources,
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-6 sm:p-8 no-print space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-3 font-display text-2xl">
            <span
              className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary"
              aria-hidden="true"
            >
              <MessageCircle className="size-5" />
            </span>
            Vedic AI Voice &amp; Chat Companion
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore your reading with an empathetic, context-aware astrological companion. Speak or type below.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-full bg-[var(--gold)]/10 px-3 py-1 text-xs text-[var(--gold)] font-medium border border-[var(--gold)]/20">
            Psychological Safety Enabled
          </span>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="pt-2 flex flex-wrap gap-2">
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

      {/* Messages Feed */}
      <div className="mt-4 space-y-4" aria-live="polite">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary/20 text-foreground"
                    : m.isCrisis
                    ? "border border-rose-500/40 bg-rose-500/10 text-foreground shadow-lg"
                    : "border border-border bg-secondary/40 text-foreground/90"
                }`}
              >
                {/* Crisis Intercept Badge */}
                {m.isCrisis && (
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-rose-400 border-b border-rose-500/30 pb-2">
                    <HeartHandshake className="size-4 text-rose-400" />
                    <span>Confidential Support &amp; Care Helpline</span>
                  </div>
                )}

                {normalizeChatContent(m.content)}

                {/* Direct click-to-call helpline cards */}
                {m.crisisResources && m.crisisResources.length > 0 && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 pt-2 border-t border-rose-500/30">
                    {m.crisisResources.map((c) => (
                      <a
                        key={c.name}
                        href={`tel:${c.phone}`}
                        className="flex items-center justify-between rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/30"
                      >
                        <span>{c.name}</span>
                        <span className="flex items-center gap-1 text-[var(--gold)]">
                          <Phone className="size-3" /> {c.phone}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* TTS Read Aloud button for assistant messages */}
              {m.role === "assistant" && !m.isCrisis && (
                <button
                  type="button"
                  onClick={() => handleSpeak(m.content, i)}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-0.5 rounded-md hover:bg-secondary/40"
                  title="Read aloud"
                >
                  {speakingIndex === i ? (
                    <>
                      <VolumeX className="size-3 text-rose-400" /> Stop listening
                    </>
                  ) : (
                    <>
                      <Volume2 className="size-3 text-[var(--gold)]" /> Listen to audio
                    </>
                  )}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-[var(--gold)]" />
              <span>Consulting planetary ephemeris &amp; classical sutras...</span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Input Bar with Push-to-Talk and Send */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
        className="relative flex items-center gap-2 pt-2"
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={isListening ? "Listening to your voice..." : "Ask about your dasha, transits, or career..."}
          disabled={busy}
          className={`pr-20 ${isListening ? "border-emerald-400 ring-1 ring-emerald-400" : ""}`}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {/* Push to talk voice button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-1.5 rounded-lg transition-colors ${
              isListening
                ? "bg-rose-500 text-white animate-pulse"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            title={isListening ? "Stop listening" : "Push to talk voice input"}
          >
            {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>

          {/* Send text button */}
          <Button
            type="submit"
            size="sm"
            disabled={busy || value.trim().length < 2}
            className="h-7 px-2.5"
          >
            <Send className="size-3.5" />
          </Button>
        </div>
      </form>
    </section>
  );
}
