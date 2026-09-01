import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { AiError, callGemini, parseJsonLoose } from "./gemini.server";
import { SYSTEM_PROMPT, buildChatSystemPrompt, buildReadingPrompt } from "./prompts";
import {
  DISCLAIMER,
  emptyAstrologyData,
  type AstrologyReading,
  type BirthDetails,
} from "@/types/astrology";

const birthSchema = z.object({
  name: z.string().max(80).optional().default(""),
  dateOfBirth: z.string().min(4, "Date of birth is required").max(40),
  timeOfBirth: z.string().min(3, "Time of birth is required").max(20),
  birthCity: z.string().min(1, "Birth city is required").max(80),
  birthState: z.string().max(80).optional().default(""),
  birthCountry: z.string().min(1, "Birth country is required").max(80),
  currentLocation: z.string().max(120).optional().default(""),
  gender: z.string().max(40).optional().default(""),
  interests: z.array(z.string().max(40)).max(12).optional().default([]),
});

const section = z.object({ title: z.string().default(""), content: z.string().default("") });

const readingSchema = z.object({
  summary: z.object({ headline: z.string().default(""), overview: z.string().default("") }),
  personality: section,
  strengths: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  planetaryInsights: z
    .array(
      z.object({
        planet: z.string().default(""),
        symbol: z.string().default(""),
        interpretation: z.string().default(""),
      }),
    )
    .default([]),
  houseInsights: z
    .array(
      z.object({
        house: z.string().default(""),
        area: z.string().default(""),
        interpretation: z.string().default(""),
      }),
    )
    .default([]),
  career: section,
  finance: section,
  relationships: section,
  education: section,
  spirituality: section,
  currentFocus: section,
  guidance: z
    .array(z.object({ title: z.string().default(""), description: z.string().default("") }))
    .default([]),
  disclaimer: z.string().default(DISCLAIMER),
});

function friendly(error: unknown): never {
  if (error instanceof AiError) throw new Error(error.message);
  throw new Error("Something went wrong while generating your reading. Please try again.");
}

export const generateReading = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => birthSchema.parse(data))
  .handler(async ({ data }) => {
    const birth = data as BirthDetails;
    try {
      const raw = await callGemini([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildReadingPrompt(birth, emptyAstrologyData) },
      ]);

      const parsed = parseJsonLoose<unknown>(raw);
      if (!parsed) {
        throw new AiError(
          "The reading could not be formatted correctly. Please try generating it again.",
          502,
        );
      }

      const result = readingSchema.safeParse(parsed);
      if (!result.success) {
        throw new AiError(
          "The reading came back incomplete. Please try generating it again.",
          502,
        );
      }

      const reading: AstrologyReading = {
        ...result.data,
        disclaimer: result.data.disclaimer || DISCLAIMER,
      };

      return {
        reading,
        astrologyData: emptyAstrologyData,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      friendly(error);
    }
  });

export const askGuide = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
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
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const answer = await callGemini(
        [
          { role: "system", content: buildChatSystemPrompt(data.context) },
          ...data.history,
          { role: "user", content: data.question },
        ],
        1200,
      );
      return { answer };
    } catch (error) {
      friendly(error);
    }
  });
