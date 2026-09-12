import { z } from "zod";
import { parseJsonLoose, streamGemini } from "@/lib/gemini.server";
import { synthesizeReadingPayload } from "@/lib/agents/narrative-synthesis";
import { calculateVedicChart, toLegacyAstrologyData, type CompleteVedicChart } from "@/lib/vedic";
import { computeChartHash, getCachedVedicChart, setCachedVedicChart } from "@/lib/cache/redis";
import { DISCLAIMER, type AstrologyReading, type BirthDetails } from "@/types/astrology";

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
    /* fallback */
  }
  const isIndia = country.toLowerCase().includes("india");
  return isIndia ? { lat: 28.6139, lon: 77.209, tz: 5.5 } : { lat: 51.5074, lon: -0.1278, tz: 0.0 };
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const birth = birthSchema.parse(json) as BirthDetails;

    let lat = birth.latitude;
    let lon = birth.longitude;
    let tz = birth.timezoneOffsetHours;

    if (lat === undefined || lon === undefined || tz === undefined) {
      const geo = await resolveCoordinates(birth.birthCity, birth.birthCountry);
      lat = lat ?? geo.lat;
      lon = lon ?? geo.lon;
      tz = tz ?? geo.tz;
    }

    // Deterministic Redis Cache
    const hash = computeChartHash(birth.dateOfBirth, birth.timeOfBirth, lat, lon, tz);
    let vedicChart: CompleteVedicChart | null = await getCachedVedicChart(hash);

    if (!vedicChart) {
      vedicChart = calculateVedicChart({
        dateOfBirth: birth.dateOfBirth,
        timeOfBirth: birth.timeOfBirth,
        latitude: lat,
        longitude: lon,
        timezoneOffsetHours: tz,
        cityName: birth.birthCity,
        countryName: birth.birthCountry,
      });
      await setCachedVedicChart(hash, vedicChart);
    }

    const astrologyData = toLegacyAstrologyData(vedicChart);

    // Run Multi-Agent Orchestration
    const { systemPrompt, userPrompt } = synthesizeReadingPayload(birth, vedicChart);

    // Return Server-Sent Events stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send immediate astronomical chart payload
        controller.enqueue(
          encoder.encode(
            `event: chart\ndata: ${JSON.stringify({ vedicChart, astrologyData })}\n\n`,
          ),
        );

        let accumulated = "";

        try {
          for await (const chunk of streamGemini([
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ])) {
            accumulated += chunk;
            controller.enqueue(
              encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`),
            );
          }

          const parsed = parseJsonLoose<any>(accumulated);
          const reading: AstrologyReading = parsed || {
            summary: { headline: "Your Cosmic Profile", overview: accumulated.slice(0, 300) },
            personality: { title: "Personality", content: accumulated.slice(0, 400) },
            strengths: ["Curiosity", "Resilience", "Leadership"],
            challenges: ["Patience", "Work-life balance"],
            planetaryInsights: [],
            houseInsights: [],
            career: { title: "Career", content: "Analysis in progress." },
            finance: { title: "Finance", content: "Analysis in progress." },
            relationships: { title: "Relationships", content: "Analysis in progress." },
            education: { title: "Education", content: "Analysis in progress." },
            spirituality: { title: "Spirituality", content: "Analysis in progress." },
            currentFocus: { title: "Current Focus", content: "Analysis in progress." },
            guidance: [{ title: "Reflect", description: "Cultivate awareness." }],
            disclaimer: DISCLAIMER,
          };

          controller.enqueue(
            encoder.encode(
              `event: complete\ndata: ${JSON.stringify({
                reading,
                astrologyData,
                vedicChart,
                generatedAt: new Date().toISOString(),
              })}\n\n`,
            ),
          );
        } catch (streamErr) {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({
                error: streamErr instanceof Error ? streamErr.message : "Stream error",
              })}\n\n`,
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Invalid request" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
}
