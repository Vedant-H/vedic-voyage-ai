import { parseEphemerisFacts, type AstrologicalFactSheet } from "./data-parser";
import { retrieveScripturalContext, type ScripturalContext } from "./scriptural-rag";
import type { CompleteVedicChart } from "../vedic";
import type { BirthDetails } from "@/types/astrology";

export const AGENTIC_SYSTEM_PROMPT = `You are an enlightened, classical Vedic Jyotish Master and modern analytical guide.
You are generating an in-depth, chapter-by-chapter Vedic astrology profile based on rigorously computed astronomical chart data and classical Brihat Parashara Hora Shastra (BPHS) principles.

CORE DIRECTIVES:
1. Strict Grounding: Base your interpretations solely on the provided calculated Lagna, Moon sign, Nakshatra, House lords, active Vimshottari Dashas, and scriptural principles. Never invent non-existent planetary placements.
2. Tone & Philosophy: Modern, empowering, warm, dignified, and insightful. Avoid fatalistic or fear-based language. Emphasize free will, conscious dharma, and constructive self-evolution.
3. Language: Clear, articulate, literary, and evocative without using cheap horoscope cliches.
4. Traditional Remedies: When recommending remedies, focus exclusively on non-commercial, sattvic practices (meditation, breathwork, charity to causes, honoring parents/teachers, reflective journaling, cultivating specific virtues). Never recommend spending money on expensive gemstones or commercial rituals.
5. Format: You MUST output strictly valid JSON conforming exactly to the requested schema. No markdown formatting around the JSON, no prologue, and no epilogue.`;

export function buildAgenticPrompt(
  birth: BirthDetails,
  facts: AstrologicalFactSheet,
  scriptures: ScripturalContext,
): string {
  const jsonSchema = `{
  "summary": { "headline": "string (engaging 5-8 word cosmic title)", "overview": "string (150-200 words holistic overview of life blueprint)" },
  "personality": { "title": "Personality & Inner Nature", "content": "string (180-240 words synthesizing Lagna, Moon sign, and Nakshatra)" },
  "strengths": ["string (4-6 distinct, specific core strengths)"],
  "challenges": ["string (3-5 gentle, constructive growth areas)"],
  "planetaryInsights": [
    { "planet": "Sun", "symbol": "☉", "interpretation": "string (50-80 words on role in chart)" },
    { "planet": "Moon", "symbol": "☽", "interpretation": "string (50-80 words on mind and emotions)" },
    { "planet": "Mars", "symbol": "♂", "interpretation": "string (50-80 words on energy and drive)" },
    { "planet": "Mercury", "symbol": "☿", "interpretation": "string (50-80 words on intellect and speech)" },
    { "planet": "Jupiter", "symbol": "♃", "interpretation": "string (50-80 words on wisdom and fortune)" },
    { "planet": "Venus", "symbol": "♀", "interpretation": "string (50-80 words on love and refinement)" },
    { "planet": "Saturn", "symbol": "♄", "interpretation": "string (50-80 words on karma and discipline)" },
    { "planet": "Rahu", "symbol": "☊", "interpretation": "string (50-80 words on worldly ambition and growth edge)" },
    { "planet": "Ketu", "symbol": "☋", "interpretation": "string (50-80 words on detachment and spiritual insight)" }
  ],
  "houseInsights": [
    { "house": "1st House (Tanu Bhava)", "area": "Self & Vitality", "interpretation": "string" },
    { "house": "2nd House (Dhana Bhava)", "area": "Wealth & Speech", "interpretation": "string" },
    { "house": "7th House (Yuvati Bhava)", "area": "Union & Partnerships", "interpretation": "string" },
    { "house": "9th House (Dharma Bhava)", "area": "Higher Wisdom & Luck", "interpretation": "string" },
    { "house": "10th House (Karma Bhava)", "area": "Vocation & Public Honor", "interpretation": "string" }
  ],
  "career": { "title": "Career, Vocation & Dharma", "content": "string (200-260 words analyzing 10th house, active Dasha, and natural talents)" },
  "finance": { "title": "Wealth, Assets & Opportunities", "content": "string (180-220 words analyzing 2nd and 11th houses)" },
  "relationships": { "title": "Relationships, Love & Partnerships", "content": "string (180-220 words analyzing 7th house and Venus)" },
  "education": { "title": "Intellect, Knowledge & Mastery", "content": "string (160-200 words analyzing 4th and 5th houses)" },
  "spirituality": { "title": "Spiritual Evolution & Higher Purpose", "content": "string (160-200 words analyzing 9th and 12th houses, Rahu/Ketu)" },
  "currentFocus": { "title": "Current Life Themes & Planetary Periods", "content": "string (180-240 words directly synthesizing the active Vimshottari Mahadasha/Antardasha)" },
  "guidance": [
    { "title": "string (Actionable title)", "description": "string (Specific practical or meditative advice)" },
    { "title": "string", "description": "string" },
    { "title": "string", "description": "string" },
    { "title": "string", "description": "string" },
    { "title": "string", "description": "string" }
  ],
  "disclaimer": "This reading is synthesized using AI informed by classical Vedic principles for personal reflection and guidance. It does not replace medical, legal, or financial professional advice."
}`;

  return `USER DETAILS:
Name: ${birth.name || "Explorer"}
Date of Birth: ${birth.dateOfBirth}
Time of Birth: ${birth.timeOfBirth}
Place of Birth: ${[birth.birthCity, birth.birthState, birth.birthCountry].filter(Boolean).join(", ")}
Areas of Priority Focus: ${birth.interests.length ? birth.interests.join(", ") : "Complete Life Reading"}

MATHEMATICAL ASTROLOGICAL FACTS (PARSER AGENT OUTPUT):
• Lagna (Ascendant): ${facts.lagnaSign} (${facts.lagnaDegree}) in ${facts.lagnaNakshatra}
• Lagna Lord: ${facts.lagnaLord} placed in House ${facts.lagnaLordPlacement.house} (${facts.lagnaLordPlacement.sign}) in ${facts.lagnaLordPlacement.state} dignity
• Moon Sign: ${facts.moonSign} in ${facts.moonNakshatra} (Pada ${facts.moonPada})
• Sun Sign: ${facts.sunSign} in ${facts.sunNakshatra}
• Active Vimshottari Dasha: ${facts.activeDasha ? `${facts.activeDasha.mahadasha} Mahadasha with ${facts.activeDasha.antardasha} Antardasha and ${facts.activeDasha.pratyantardasha} Pratyantardasha (transitioning around ${facts.activeDasha.endDate.slice(0, 10)})` : "Calculated from Moon"}
• Exalted Planets: ${facts.exaltedPlanets.length ? facts.exaltedPlanets.join(", ") : "None"}
• Debilitated Planets: ${facts.debilitatedPlanets.length ? facts.debilitatedPlanets.join(", ") : "None"}
• Own Sign Planets: ${facts.ownSignPlanets.length ? facts.ownSignPlanets.join(", ") : "None"}
• Retrograde Planets: ${facts.retrogradePlanets.length ? facts.retrogradePlanets.join(", ") : "None (Nodes excepted)"}
• Combust Planets: ${facts.combustPlanets.length ? facts.combustPlanets.join(", ") : "None"}
• Planetary Yogas Formed: ${facts.yogasPresent.length ? facts.yogasPresent.map((y) => `${y.name} (${y.description})`).join(" | ") : "Balanced placements"}
• Doshas Assessment:
  - Manglik Status: ${facts.doshas.isManglik ? `Present (${facts.doshas.manglikSeverity} severity) - ${facts.doshas.manglikDetails}` : "Absent"}
  - Kalsarpa Status: ${facts.doshas.hasKalsarpa ? facts.doshas.kalsarpaType : "Absent"}
  - Saturn Sade Sati: ${facts.doshas.sadeSatiActive ? `Active in ${facts.doshas.sadeSatiPhase} phase` : "Not currently active"}

CLASSICAL SCRIPTURAL CANON (RAG AGENT RETRIEVAL):
${scriptures.bphsHousePrinciples.join("\n")}
${scriptures.planetaryKarakas.join("\n")}
${scriptures.classicalYogasContext.join("\n")}
Authentic Recommended Sattvic Remedies:
${scriptures.sattvicRemedies.map((r) => `• ${r.planet}: ${r.practice} (Rationale: ${r.rationale})`).join("\n")}

INSTRUCTIONS:
Compose a breathtaking, coherent, authentic reading respecting all given mathematical facts.
Return strictly the JSON object matching this exact shape:
${jsonSchema}`;
}

/**
 * Prepares the synthesized agent prompt ready for LLM consumption.
 */
export function synthesizeReadingPayload(
  birth: BirthDetails,
  chart: CompleteVedicChart,
): { systemPrompt: string; userPrompt: string } {
  const facts = parseEphemerisFacts(chart);
  const scriptures = retrieveScripturalContext(facts);
  const userPrompt = buildAgenticPrompt(birth, facts, scriptures);
  return {
    systemPrompt: AGENTIC_SYSTEM_PROMPT,
    userPrompt,
  };
}
