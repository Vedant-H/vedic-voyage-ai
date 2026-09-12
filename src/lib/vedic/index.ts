import {
  calculateAscendant,
  calculateLahiriAyanamsha,
  calculatePlanetaryPositions,
  dateToJulianDay,
  type AscendantPosition,
  type PlanetPosition,
} from "./ephemeris";
import { calculateHouses, getPlanetHouseMap, type HouseInfo } from "./houses";
import { calculateVimshottariDasha, type CurrentDashaState, type MahadashaInfo } from "./dasha";
import {
  analyzeDoshas,
  analyzePlanets,
  detectYogas,
  type DoshaAnalysis,
  type PlanetAnalysis,
  type YogaFound,
} from "./analysis";
import type { AstrologyData } from "@/types/astrology";

export interface VedicCalculationInput {
  dateOfBirth: string; // YYYY-MM-DD or DD-MM-YYYY
  timeOfBirth: string; // HH:mm or HH:mm:ss
  latitude: number;
  longitude: number;
  timezoneOffsetHours?: number; // e.g. +5.5 for IST. If omitted, defaults to coordinates or 0
  cityName?: string;
  countryName?: string;
}

export interface CompleteVedicChart {
  calculationTimestamp: string;
  birthUtcIso: string;
  coordinates: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  ayanamsha: {
    name: "Lahiri (Chitra Paksha)";
    degrees: number;
    formatted: string;
  };
  ascendant: AscendantPosition;
  planets: Record<string, PlanetPosition>;
  houses: HouseInfo[];
  planetHouseMap: Record<string, number>;
  dasha: {
    current: CurrentDashaState | null;
    balanceAtBirth: { lord: string; yearsRemaining: number };
    mahadashas: MahadashaInfo[];
  };
  analysis: {
    planets: Record<string, PlanetAnalysis>;
    doshas: DoshaAnalysis;
    yogas: YogaFound[];
  };
}

/**
 * Parses user birth date and time into an absolute UTC Date object.
 */
export function parseBirthToUtc(
  dateStr: string,
  timeStr: string,
  tzOffsetHours: number = 0,
): Date {
  let year: number;
  let month: number;
  let day: number;

  const parts = dateStr.trim().split(/[-/]/).map(Number);
  if (parts.length < 3 || parts.some(isNaN)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD or DD-MM-YYYY.`);
  }

  // Handle DD-MM-YYYY vs YYYY-MM-DD
  if (parts[0]! > 1000) {
    [year, month, day] = parts as [number, number, number];
  } else {
    [day, month, year] = parts as [number, number, number];
  }

  const timeParts = timeStr.trim().split(":").map(Number);
  const hours = timeParts[0] || 0;
  const minutes = timeParts[1] || 0;
  const seconds = timeParts[2] || 0;

  // Compute local time in UTC milliseconds by subtracting the timezone offset
  const localUtcMs = Date.UTC(year, month - 1, day, hours, minutes, seconds);
  const offsetMs = tzOffsetHours * 3600 * 1000;
  return new Date(localUtcMs - offsetMs);
}

/**
 * Master calculation orchestrator: Computes the complete, mathematically verified Vedic chart.
 */
export function calculateVedicChart(input: VedicCalculationInput): CompleteVedicChart {
  const tzOffset = input.timezoneOffsetHours ?? guessTimezoneOffset(input.longitude);
  const birthUtc = parseBirthToUtc(input.dateOfBirth, input.timeOfBirth, tzOffset);

  const jd = dateToJulianDay(birthUtc);
  const ayanamshaDeg = calculateLahiriAyanamsha(jd);

  // 1. Calculate Sidereal Ascendant (Lagna)
  const ascendant = calculateAscendant(birthUtc, input.latitude, input.longitude, ayanamshaDeg);

  // 2. Calculate 9 Sidereal Planetary Positions
  const planets = calculatePlanetaryPositions(birthUtc, ayanamshaDeg);

  // 3. Compute Houses and place planets
  const houses = calculateHouses(ascendant, planets);
  const planetHouseMap = getPlanetHouseMap(ascendant, planets);

  // 4. Calculate Vimshottari Dashas based on Moon
  const moon = planets["Moon"]!;
  const dashaResult = calculateVimshottariDasha(moon.siderealLongitude, birthUtc, new Date());

  // 5. Analyze Planetary Dignities, Doshas, and Yogas
  const planetAnalysis = analyzePlanets(planets, planetHouseMap);
  const doshaAnalysis = analyzeDoshas(planets, planetHouseMap);
  const yogas = detectYogas(planets, planetHouseMap, houses);

  const dmsAyanamsha = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.round(((deg - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}"`;
  };

  return {
    calculationTimestamp: new Date().toISOString(),
    birthUtcIso: birthUtc.toISOString(),
    coordinates: {
      latitude: input.latitude,
      longitude: input.longitude,
      city: input.cityName,
      country: input.countryName,
    },
    ayanamsha: {
      name: "Lahiri (Chitra Paksha)",
      degrees: ayanamshaDeg,
      formatted: dmsAyanamsha(ayanamshaDeg),
    },
    ascendant,
    planets,
    houses,
    planetHouseMap,
    dasha: {
      current: dashaResult.currentDasha,
      balanceAtBirth: dashaResult.balanceAtBirth,
      mahadashas: dashaResult.mahadashas,
    },
    analysis: {
      planets: planetAnalysis,
      doshas: doshaAnalysis,
      yogas,
    },
  };
}

/**
 * Converts a CompleteVedicChart into the legacy AstrologyData format for backwards compatibility.
 */
export function toLegacyAstrologyData(chart: CompleteVedicChart): AstrologyData {
  const moon = chart.planets["Moon"];
  return {
    ascendant: `${chart.ascendant.signName} (${chart.ascendant.signSanskrit}) ${chart.ascendant.formattedPosition} · ${chart.ascendant.nakshatra.name} (Pada ${chart.ascendant.pada})`,
    moonSign: moon ? `${moon.signName} (${moon.signSanskrit})` : null,
    nakshatra: moon ? `${moon.nakshatra.name} (Pada ${moon.pada})` : null,
    planetPositions: Object.values(chart.planets).map((p) => ({
      planet: p.name,
      sign: p.signName,
      house: chart.planetHouseMap[p.name] || 1,
    })),
    houses: chart.houses.map((h) => ({
      house: h.houseNumber,
      sign: h.signName,
    })),
    dasha: chart.dasha.current
      ? {
          mahadasha: chart.dasha.current.mahadasha,
          antardasha: chart.dasha.current.antardasha,
        }
      : null,
    panchang: {
      Ayanamsha: chart.ayanamsha.formatted,
      Lagna: `${chart.ascendant.signName} ${chart.ascendant.formattedPosition}`,
      Nakshatra: moon ? `${moon.nakshatra.name} - Pada ${moon.pada}` : "N/A",
      "Current Mahadasha": chart.dasha.current?.mahadasha ?? "N/A",
      "Current Antardasha": chart.dasha.current?.antardasha ?? "N/A",
    },
  };
}

/** Fallback rough timezone approximation based on longitude if not explicitly resolved */
function guessTimezoneOffset(longitude: number): number {
  // Rough estimate: 15 degrees longitude = 1 hour
  return Math.round((longitude / 15.0) * 2) / 2;
}
