import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateKundliMilan } from "@/lib/vedic/milan";
import { calculateVedicChart, type CompleteVedicChart } from "@/lib/vedic";
import { callGemini } from "@/lib/gemini.server";

const milanSchema = z.object({
  chart1: z.any().optional(),
  chart2: z.any().optional(),
  birth1: z
    .object({
      name: z.string().optional(),
      dateOfBirth: z.string(),
      timeOfBirth: z.string(),
      latitude: z.number().default(28.6139),
      longitude: z.number().default(77.209),
      timezoneOffsetHours: z.number().default(5.5),
      cityName: z.string().optional(),
    })
    .optional(),
  birth2: z
    .object({
      name: z.string().optional(),
      dateOfBirth: z.string(),
      timeOfBirth: z.string(),
      latitude: z.number().default(28.6139),
      longitude: z.number().default(77.209),
      timezoneOffsetHours: z.number().default(5.5),
      cityName: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = milanSchema.parse(json);

    let c1: CompleteVedicChart = data.chart1;
    let c2: CompleteVedicChart = data.chart2;

    if (!c1 && data.birth1) {
      c1 = calculateVedicChart({
        dateOfBirth: data.birth1.dateOfBirth,
        timeOfBirth: data.birth1.timeOfBirth,
        latitude: data.birth1.latitude,
        longitude: data.birth1.longitude,
        timezoneOffsetHours: data.birth1.timezoneOffsetHours,
        cityName: data.birth1.cityName || "Partner 1",
      });
    }

    if (!c2 && data.birth2) {
      c2 = calculateVedicChart({
        dateOfBirth: data.birth2.dateOfBirth,
        timeOfBirth: data.birth2.timeOfBirth,
        latitude: data.birth2.latitude,
        longitude: data.birth2.longitude,
        timezoneOffsetHours: data.birth2.timezoneOffsetHours,
        cityName: data.birth2.cityName || "Partner 2",
      });
    }

    if (!c1 || !c2) {
      return NextResponse.json(
        { error: "Two valid charts or birth details are required for Kundli Milan matching." },
        { status: 400 }
      );
    }

    const milanResult = calculateKundliMilan(c1, c2);

    // AI Relationship Commentary Synthesis
    let aiCommentary = "";
    try {
      const prompt = `You are a compassionate, classical Vedic Astrologer providing Kundli Milan guidance.
The 36-point Guna Milan score is ${milanResult.totalScore}/36 (${milanResult.percentage}%, Verdict: ${milanResult.verdict}).
Partner 1 Moon: ${c1.planets["Moon"]?.signName} (${c1.planets["Moon"]?.nakshatra.name})
Partner 2 Moon: ${c2.planets["Moon"]?.signName} (${c2.planets["Moon"]?.nakshatra.name})
Manglik Status: ${milanResult.manglikAnalysis.summary}
Nadi Points: ${milanResult.kutas.nadi.pointsReceived}/8
Bhakoot Points: ${milanResult.kutas.bhakoot.pointsReceived}/7
Graha Maitri: ${milanResult.kutas.grahaMaitri.pointsReceived}/5

Provide an encouraging, 120-word psychological and astrological synthesis of their dynamic. Emphasize conscious communication, mutual respect, and emotional growth. Avoid any fatalism.`;

      aiCommentary = await callGemini(
        [
          { role: "system", content: "You are an enlightened relationship counselor and Vedic astrologer." },
          { role: "user", content: prompt },
        ],
        500
      );
    } catch {
      aiCommentary = `With a compatibility score of ${milanResult.totalScore}/36, this union reflects strong foundational potential. Honor each other's individual rhythms, practice transparent emotional listening, and celebrate shared milestones.`;
    }

    return NextResponse.json({
      milanResult,
      aiCommentary,
      partner1: {
        ascendant: c1.ascendant.signName,
        moon: c1.planets["Moon"]?.signName,
        nakshatra: c1.planets["Moon"]?.nakshatra.name,
      },
      partner2: {
        ascendant: c2.ascendant.signName,
        moon: c2.planets["Moon"]?.signName,
        nakshatra: c2.planets["Moon"]?.nakshatra.name,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kundli Milan calculation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
