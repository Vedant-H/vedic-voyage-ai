import { NextResponse } from "next/server";
import { z } from "zod";

import { AiError, callGemini } from "@/lib/gemini.server";
import { buildChatSystemPrompt } from "@/lib/prompts";

const askSchema = z.object({
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

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const data = askSchema.parse(payload);

    const answer = await callGemini(
      [
        { role: "system", content: buildChatSystemPrompt(data.context) },
        ...data.history,
        { role: "user", content: data.question },
      ],
      1200,
    );

    return NextResponse.json({ answer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Please check your question and try again." },
        { status: 400 },
      );
    }

    if (error instanceof AiError) {
      return NextResponse.json({ error: error.message }, { status: error.status || 500 });
    }

    return NextResponse.json(
      { error: "Something went wrong while answering your question. Please try again." },
      { status: 500 },
    );
  }
}
