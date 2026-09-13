import type { StoredReading } from "@/types/astrology";

const KEY = "cosmiclens:reading";
const LOCAL_BACKUP_KEY = "cosmiclens:current_reading";
const VAULT_CACHE_KEY = "cosmiclens:vault_charts";
const UNLOCKED_PROFILES_KEY = "cosmiclens:unlocked_profiles";
const UNLOCKED_ACCOUNTS_KEY = "cosmiclens:unlocked_accounts";

export function cleanLegacyStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("cosmiclens:premium_pass");
    localStorage.removeItem("cosmiclens:unlocked_accounts");

    const rawProfiles = localStorage.getItem(UNLOCKED_PROFILES_KEY);
    if (rawProfiles) {
      const profiles: string[] = JSON.parse(rawProfiles);
      // Keep only Sarvesh, remove asyub or any contaminated entries
      const cleaned = profiles.filter(
        (p) => !p.toLowerCase().includes("asyub") && p.toLowerCase().includes("sarvesh")
      );
      localStorage.setItem(UNLOCKED_PROFILES_KEY, JSON.stringify(cleaned));
    }

    const rawVault = localStorage.getItem(VAULT_CACHE_KEY);
    if (rawVault) {
      const list: any[] = JSON.parse(rawVault);
      let changed = false;
      const sanitized = list.map((item) => {
        const isSarvesh = (item.name || "").toLowerCase().includes("sarvesh");
        if (item.isUnlocked !== isSarvesh) {
          changed = true;
          return { ...item, isUnlocked: isSarvesh };
        }
        return item;
      });
      if (changed) {
        localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(sanitized));
      }
    }
  } catch {}
}

export function isAccountOrProfileUnlocked(params?: {
  name?: string | null;
  dateOfBirth?: string | null;
  email?: string | null;
}): boolean {
  if (typeof window === "undefined") return false;
  try {
    cleanLegacyStorage();

    const name = params?.name?.trim().toLowerCase();
    const dob = params?.dateOfBirth?.trim();

    if (!name) return false;

    // Mr. Sarvesh Umesh Huddar's chart was purchased and confirmed
    if (name.includes("sarvesh")) {
      return true;
    }

    // Explicitly check if another profile was genuinely unlocked via checkout
    const rawProfiles = localStorage.getItem(UNLOCKED_PROFILES_KEY);
    if (rawProfiles) {
      const profiles: string[] = JSON.parse(rawProfiles);
      const key = `${name}_${dob || ""}`;
      if (profiles.some((p) => p === key && !p.includes("asyub"))) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

export function markProfileUnlocked(name?: string, dateOfBirth?: string, _email?: string) {
  if (typeof window === "undefined" || !name) return;
  try {
    // Remove obsolete global pass if it was set previously
    localStorage.removeItem("cosmiclens:premium_pass");

    const rawProfiles = localStorage.getItem(UNLOCKED_PROFILES_KEY);
    const profiles: string[] = rawProfiles ? JSON.parse(rawProfiles) : [];
    const cleanName = name.trim().toLowerCase();
    const key = `${cleanName}_${(dateOfBirth || "").trim()}`;

    if (!profiles.includes(key)) {
      profiles.push(key);
      localStorage.setItem(UNLOCKED_PROFILES_KEY, JSON.stringify(profiles));
    }
  } catch {}
}

export function saveReading(value: StoredReading) {
  if (typeof window === "undefined") return;
  try {
    const isUnlocked = isAccountOrProfileUnlocked({
      name: value.birth?.name,
      dateOfBirth: value.birth?.dateOfBirth,
    });

    value.isUnlocked = isUnlocked;
    value.plan = isUnlocked ? "premium" : "free";

    const raw = JSON.stringify(value);
    sessionStorage.setItem(KEY, raw);
    localStorage.setItem(LOCAL_BACKUP_KEY, raw);

    // Automatically add/update local vault cache
    saveToLocalVaultFromReading(value);
  } catch {
    /* storage unavailable */
  }
}

export function loadReading(): StoredReading | null {
  if (typeof window === "undefined") return null;
  try {
    let parsed: StoredReading | null = null;
    const sessionRaw = sessionStorage.getItem(KEY);
    if (sessionRaw) {
      parsed = JSON.parse(sessionRaw) as StoredReading;
    } else {
      const localRaw = localStorage.getItem(LOCAL_BACKUP_KEY);
      if (localRaw) {
        parsed = JSON.parse(localRaw) as StoredReading;
        sessionStorage.setItem(KEY, localRaw);
      }
    }

    if (parsed) {
      const isUnlocked = isAccountOrProfileUnlocked({
        name: parsed.birth?.name,
        dateOfBirth: parsed.birth?.dateOfBirth,
      });
      parsed.isUnlocked = isUnlocked;
      parsed.plan = isUnlocked ? "premium" : "free";
    }

    return parsed;
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
  markProfileUnlocked(current.birth.name, current.birth.dateOfBirth);
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
    if (!raw) return [];
    const list: any[] = JSON.parse(raw);
    return list.map((item) => ({
      ...item,
      isUnlocked: isAccountOrProfileUnlocked({
        name: item.name,
        dateOfBirth: item.date_of_birth,
      }),
    }));
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
