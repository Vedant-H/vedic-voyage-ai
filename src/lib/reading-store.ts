import type { StoredReading } from "@/types/astrology";

const KEY = "cosmiclens:reading";
const LOCAL_BACKUP_KEY = "cosmiclens:current_reading";
const VAULT_CACHE_KEY = "cosmiclens:vault_charts";

export function saveReading(value: StoredReading) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(value);
    sessionStorage.setItem(KEY, raw);
    localStorage.setItem(LOCAL_BACKUP_KEY, raw);

    // Automatically add to local vault cache so reports are never lost
    saveToLocalVaultFromReading(value);
  } catch {
    /* storage unavailable */
  }
}

export function loadReading(): StoredReading | null {
  if (typeof window === "undefined") return null;
  try {
    const sessionRaw = sessionStorage.getItem(KEY);
    if (sessionRaw) {
      return JSON.parse(sessionRaw) as StoredReading;
    }
    const localRaw = localStorage.getItem(LOCAL_BACKUP_KEY);
    if (localRaw) {
      const parsed = JSON.parse(localRaw) as StoredReading;
      // Reseed session
      sessionStorage.setItem(KEY, localRaw);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearReading() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
  localStorage.removeItem(LOCAL_BACKUP_KEY);
}

export function markReadingUnlocked(): StoredReading | null {
  const current = loadReading();
  if (!current) return null;
  const updated: StoredReading = {
    ...current,
    isUnlocked: true,
    plan: "premium",
    unlockedAt: new Date().toISOString(),
  };
  saveReading(updated);
  return updated;
}

// Local Vault Cache helpers for guaranteed report persistence across sessions
export function getLocalVaultCharts(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VAULT_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToLocalVaultFromReading(stored: StoredReading) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalVaultCharts();
    const name = stored.birth.name || "My Chart";
    const dob = stored.birth.dateOfBirth;
    const tob = stored.birth.timeOfBirth;
    const place = [stored.birth.birthCity, stored.birth.birthState, stored.birth.birthCountry]
      .filter(Boolean)
      .join(", ");

    // Check if duplicate already exists
    const existingIndex = list.findIndex(
      (c: any) =>
        (c.name || "").toLowerCase() === name.toLowerCase() &&
        c.date_of_birth === dob &&
        c.time_of_birth === tob
    );

    const chartItem = {
      id: existingIndex >= 0 ? list[existingIndex].id : `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      relationship: "Self",
      date_of_birth: dob,
      time_of_birth: tob,
      city: place,
      chart_data: stored.vedicChart,
      reading_data: stored.reading,
      isUnlocked: stored.isUnlocked || false,
      created_at: existingIndex >= 0 ? list[existingIndex].created_at : new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = chartItem;
    } else {
      list.unshift(chartItem);
    }

    localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("Failed to cache in local vault:", err);
  }
}

export function removeLocalVaultChart(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalVaultCharts().filter((c: any) => c.id !== id);
    localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(list));
  } catch {}
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
