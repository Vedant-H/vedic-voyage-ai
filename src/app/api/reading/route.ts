import { NextResponse } from "next/server";
import { z } from "zod";

import { AiError, callGemini, parseJsonLoose } from "@/lib/gemini.server";
import { SYSTEM_PROMPT, buildReadingPrompt } from "@/lib/prompts";
import {
  DISCLAIMER,
  type AstrologyReading,
  type BirthDetails,
} from "@/types/astrology";
import { calculateVedicChart, toLegacyAstrologyData, type CompleteVedicChart } from "@/lib/vedic";
import { computeChartHash, getCachedVedicChart, setCachedVedicChart } from "@/lib/cache/redis";

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
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezoneOffsetHours: z.number().optional(),
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

/** Resolves coordinates if not provided in the client payload */
async function resolveCoordinates(city: string, country: string): Promise<{ lat: number; lon: number; tz: number }> {
  try {
    const q = `${city}, ${country}`.trim();
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "CosmicLensAI/1.0" },
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const isIndia = country.toLowerCase().includes("india");
        const tz = isIndia ? 5.5 : Math.round((lon / 15.0) * 2) / 2;
        return { lat, lon, tz };
      }
    }
  } catch {
    /* fallback below */
  }
  // Default coordinates (New Delhi if India, or Greenwich)
  const isIndia = country.toLowerCase().includes("india");
  return isIndia ? { lat: 28.6139, lon: 77.209, tz: 5.5 } : { lat: 51.5074, lon: -0.1278, tz: 0.0 };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const birth = birthSchema.parse(json) as BirthDetails;

    // 1. Resolve coordinates & timezone
    let lat = birth.latitude;
    let lon = birth.longitude;
    let tz = birth.timezoneOffsetHours;

    if (lat === undefined || lon === undefined || tz === undefined) {
      const geo = await resolveCoordinates(birth.birthCity, birth.birthCountry);
      lat = lat ?? geo.lat;
      lon = lon ?? geo.lon;
      tz = tz ?? geo.tz;
    }

    // 2. Deterministic Upstash Redis Caching
    const hash = computeChartHash(birth.dateOfBirth, birth.timeOfBirth, lat, lon, tz);
    let vedicChart: CompleteVedicChart | null = await getCachedVedicChart(hash);

    if (!vedicChart) {
      // Calculate real astronomical Vedic chart
      vedicChart = calculateVedicChart({
        dateOfBirth: birth.dateOfBirth,
        timeOfBirth: birth.timeOfBirth,
        latitude: lat,
        longitude: lon,
        timezoneOffsetHours: tz,
        cityName: birth.birthCity,
        countryName: birth.birthCountry,
      });

      // Cache permanently
      await setCachedVedicChart(hash, vedicChart);
    }

    // 3. Format legacy astrology data for prompt & backwards compatibility
    const astrologyData = toLegacyAstrologyData(vedicChart);

    // 4. Call Gemini with real mathematical chart data
    const raw = await callGemini([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildReadingPrompt(birth, astrologyData) },
    ]);

    const parsed = parseJsonLoose<unknown>(raw);
    if (!parsed) {
      return NextResponse.json(
        { error: "The reading could not be formatted correctly. Please try generating it again." },
        { status: 502 },
      );
    }

    const result = readingSchema.safeParse(parsed);
    if (!result.success) {
      return NextResponse.json(
        { error: "The reading came back incomplete. Please try generating it again." },
        { status: 502 },
      );
    }

    const reading: AstrologyReading = {
      ...result.data,
      disclaimer: result.data.disclaimer || DISCLAIMER,
    };

    return NextResponse.json({
      reading,
      astrologyData,
      vedicChart,
      generatedAt: new Date().toISOString(),
    });
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
