import type { StoredReading } from "@/types/astrology";

const KEY = "cosmiclens:reading";

export function saveReading(value: StoredReading) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function loadReading(): StoredReading | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredReading) : null;
  } catch {
    return null;
  }
}

export function clearReading() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}

/** Keeps the chat context small and predictable. */
export function buildChatContext(stored: StoredReading): string {
  const { birth, reading } = stored;
  const trim = (s: string, n = 600) => (s.length > n ? `${s.slice(0, n)}…` : s);
  return [
    `Birth details — name: ${birth.name || "n/a"}, date: ${birth.dateOfBirth}, time: ${birth.timeOfBirth}, place: ${[birth.birthCity, birth.birthState, birth.birthCountry].filter(Boolean).join(", ")}, gender: ${birth.gender || "n/a"}.`,
    `Interests: ${birth.interests.join(", ") || "Complete Reading"}.`,
    `Headline: ${reading.summary.headline}`,
    `Overview: ${trim(reading.summary.overview)}`,
    `Personality: ${trim(reading.personality.content)}`,
    `Strengths: ${reading.strengths.join("; ")}`,
    `Growth areas: ${reading.challenges.join("; ")}`,
    `Career: ${trim(reading.career.content, 400)}`,
    `Finance: ${trim(reading.finance.content, 400)}`,
    `Relationships: ${trim(reading.relationships.content, 400)}`,
    `Spirituality: ${trim(reading.spirituality.content, 300)}`,
    `Current themes: ${trim(reading.currentFocus.content, 400)}`,
    `Note: no astronomical calculation engine was used; all interpretations are traditional reflections based on birth information.`,
  ].join("\n");
}
