import { NextResponse } from "next/server";
import { z } from "zod";

import { AiError, callGemini } from "@/lib/gemini.server";
import { buildChatSystemPrompt } from "@/lib/prompts";

const chatSchema = z.object({
  question: z.string().min(2).max(600),
  context: z.string().max(9000).default(""),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(8)
    .default([]),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = chatSchema.parse(json);

    // Crisis Circuit Breaker: Intercept severe distress, self-harm, or suicide intent
    const CRISIS_REGEX =
      /\b(suicid|kill\s*myself|end\s*my\s*life|want\s*to\s*die|self[\s-]*harm|hang\s*myself|slit\s*my\s*wrist|overdose|take\s*my\s*own\s*life|can'?t\s*go\s*on\s*living)\b/i;

    if (CRISIS_REGEX.test(data.question)) {
      return NextResponse.json({
        answer:
          "I hear how much pain and overwhelming weight you are carrying right now. Your life is profoundly precious, and you do not have to walk through this dark valley alone. Please speak with someone who cares and can support you right now. Compassionate, completely confidential help is available 24/7 at no cost:\n\n• India Tele-MANAS: Call 14416 or 1800-891-4416\n• India KIRAN Mental Health Helpline: 1800-599-0019\n• India Vandrevala Foundation: +91 9999 666 555\n• US / Canada Suicide & Crisis Lifeline: Call or text 988\n• UK Samaritans: Call 116 123\n• International Helplines: Visit https://findahelpline.com\n\nPlease reach out to them or a trusted loved one immediately.",
        isCrisis: true,
        crisisResources: [
          { name: "Tele-MANAS (India)", phone: "14416" },
          { name: "KIRAN Helpline (India)", phone: "1800-599-0019" },
          { name: "Vandrevala Mental Health", phone: "+919999666555" },
          { name: "988 Crisis Lifeline (US/CA)", phone: "988" },
        ],
      });
    }

    const answer = await callGemini(
      [
        { role: "system", content: buildChatSystemPrompt(data.context) },
        ...data.history,
        { role: "user", content: data.question },
      ],
      1200,
    );

    return NextResponse.json({ answer, isCrisis: false });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    if (error instanceof AiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
