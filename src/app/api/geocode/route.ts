import { NextResponse } from "next/server";

export interface GeocodeResult {
  displayName: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezoneOffsetHours: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query,
    )}&format=json&addressdetails=1&limit=6`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "CosmicLensAI/1.0 (contact@cosmiclens.ai)",
        Accept: "application/json",
      },
      next: { revalidate: 86400 }, // Cache on Next.js edge for 24h
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = (await res.json()) as Array<{
      display_name?: string;
      lat: string;
      lon: string;
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        country?: string;
      };
    }>;

    const results: GeocodeResult[] = data.map((item) => {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      const city =
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.display_name?.split(",")[0]?.trim() ||
        query;
      const state = item.address?.state || "";
      const country = item.address?.country || "";

      // Timezone estimation based on country and longitude
      const tzOffset = estimateTimezone(country, lon);

      return {
        displayName: item.display_name || `${city}, ${country}`,
        city,
        state,
        country,
        latitude: lat,
        longitude: lon,
        timezoneOffsetHours: tzOffset,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ results: [] });
  }
}

/**
 * Robust timezone offset estimator for standard major countries, falling back to longitude solar time.
 */
function estimateTimezone(country: string, lon: number): number {
  const c = country.toLowerCase();
  if (c.includes("india")) return 5.5; // IST
  if (c.includes("united kingdom") || c.includes("britain") || c.includes("england")) return 0.0; // GMT
  if (c.includes("japan")) return 9.0; // JST
  if (c.includes("nepal")) return 5.75;
  if (c.includes("sri lanka")) return 5.5;
  if (c.includes("pakistan")) return 5.0;
  if (c.includes("bangladesh")) return 6.0;
  if (c.includes("germany") || c.includes("france") || c.includes("italy") || c.includes("spain")) return 1.0; // CET
  if (c.includes("united arab emirates") || c.includes("dubai")) return 4.0;
  if (c.includes("singapore")) return 8.0;
  if (c.includes("australia")) {
    if (lon > 140) return 10.0;
    if (lon > 125) return 9.5;
    return 8.0;
  }
  // USA / Canada approximate zones based on longitude
  if (c.includes("united states") || c.includes("usa") || c.includes("canada")) {
    if (lon >= -75) return -5; // Eastern
    if (lon >= -90) return -6; // Central
    if (lon >= -105) return -7; // Mountain
    return -8; // Pacific
  }

  // Generic global approximation: 15° = 1 hour
  return Math.round((lon / 15.0) * 2) / 2;
}
