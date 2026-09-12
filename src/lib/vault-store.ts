import type { StoredReading } from "@/types/astrology";
import { calculateVedicChart } from "@/lib/vedic";

export interface VaultChartItem {
  id: string;
  name: string;
  relationship: string;
  date_of_birth: string;
  time_of_birth: string;
  city: string;
  chart_data: StoredReading["vedicChart"];
  reading_data?: StoredReading["reading"];
  created_at: string;
  syncedToCloud?: boolean;
}

const LOCAL_VAULT_KEY = "cosmiclens:local_vault";

export function getLocalVault(): VaultChartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_VAULT_KEY);
    if (!raw) return [];
    const items: VaultChartItem[] = JSON.parse(raw);

    // Deduplicate items with identical name and date of birth
    const seen = new Set<string>();
    const deduplicated: VaultChartItem[] = [];

    for (const item of items) {
      const key = `${(item.name || "").trim().toLowerCase()}_${item.date_of_birth}_${item.time_of_birth}`;
      if (!seen.has(key)) {
        seen.add(key);

        // If chart_data is somehow missing or uncalculated, calculate it on the fly
        if (!item.chart_data && item.date_of_birth && item.time_of_birth) {
          try {
            item.chart_data = calculateVedicChart({
              dateOfBirth: item.date_of_birth,
              timeOfBirth: item.time_of_birth,
              latitude: 18.0, // fallback average if missing
              longitude: 75.0,
              cityName: item.city,
            });
          } catch {}
        }

        deduplicated.push(item);
      }
    }

    return deduplicated;
  } catch {
    return [];
  }
}

export function saveToLocalVault(item: Omit<VaultChartItem, "id" | "created_at">): VaultChartItem {
  const existing = getLocalVault();
  
  // Check if chart with same name and birth date already exists
  const existingIndex = existing.findIndex(
    (e) =>
      e.name.trim().toLowerCase() === item.name.trim().toLowerCase() &&
      e.date_of_birth === item.date_of_birth
  );

  let updated: VaultChartItem[];
  let resultItem: VaultChartItem;

  // Ensure chart_data is computed if missing
  let chartData = item.chart_data;
  if (!chartData && item.date_of_birth && item.time_of_birth) {
    try {
      chartData = calculateVedicChart({
        dateOfBirth: item.date_of_birth,
        timeOfBirth: item.time_of_birth,
        latitude: 18.0,
        longitude: 75.0,
        cityName: item.city,
      });
    } catch {}
  }

  if (existingIndex >= 0) {
    // Update existing record
    resultItem = {
      ...existing[existingIndex]!,
      ...item,
      chart_data: chartData || existing[existingIndex]!.chart_data,
      reading_data: item.reading_data || existing[existingIndex]!.reading_data,
    };
    updated = [...existing];
    updated[existingIndex] = resultItem;
  } else {
    // Create new record
    resultItem = {
      ...item,
      chart_data: chartData,
      id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      created_at: new Date().toISOString(),
      syncedToCloud: false,
    };
    updated = [resultItem, ...existing];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_VAULT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }
  return resultItem;
}

export function removeFromLocalVault(id: string) {
  const existing = getLocalVault();
  const filtered = existing.filter((item) => item.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_VAULT_KEY, JSON.stringify(filtered));
    } catch {}
  }
}

export function markLocalVaultSynced(id: string) {
  const existing = getLocalVault();
  const updated = existing.map((item) =>
    item.id === id ? { ...item, syncedToCloud: true } : item
  );
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_VAULT_KEY, JSON.stringify(updated));
    } catch {}
  }
}
