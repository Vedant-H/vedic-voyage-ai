import { PLANET_DIGNITIES } from "./constants";
import type { AscendantPosition, PlanetPosition } from "./ephemeris";
import type { HouseInfo } from "./houses";

export interface PlanetAnalysis {
  name: string;
  glyph: string;
  signName: string;
  house: number;
  isExalted: boolean;
  isDebilitated: boolean;
  isOwnSign: boolean;
  isCombust: boolean;
  isRetrograde: boolean;
  dignityScore: "Exalted" | "Own Sign" | "Debilitated" | "Neutral" | "Friendly";
  summaryDescription: string;
}

export interface DoshaAnalysis {
  isManglik: boolean;
  manglikSeverity: "None" | "Low" | "Moderate" | "High";
  manglikDetails: string;
  hasKalsarpa: boolean;
  kalsarpaType: string | null;
  sadeSatiStatus: {
    isActive: boolean;
    phase: "Not Active" | "Rising Phase (12th)" | "Peak Phase (1st)" | "Setting Phase (2nd)";
    details: string;
  };
}

export interface YogaFound {
  name: string;
  sanskrit: string;
  category: "Auspicious" | "Wealth" | "Intellect" | "Spiritual";
  description: string;
  planetsInvolved: string[];
}

/**
 * Analyzes dignity, combustion, and exaltation/debilitation of all planets.
 */
export function analyzePlanets(
  planets: Record<string, PlanetPosition>,
  planetHouseMap: Record<string, number>,
): Record<string, PlanetAnalysis> {
  const sun = planets["Sun"];
  const sunSidereal = sun?.siderealLongitude ?? 0;

  const analysis: Record<string, PlanetAnalysis> = {};

  for (const [name, p] of Object.entries(planets)) {
    const dignityInfo = PLANET_DIGNITIES[name];
    if (!dignityInfo) continue;

    const isOwnSign = dignityInfo.ownSigns.includes(p.signId);
    const isExalted = p.signId === dignityInfo.exaltationSign;
    const isDebilitated = p.signId === dignityInfo.debilitationSign;

    // Check combustion (only for non-Sun, non-Rahu, non-Ketu planets)
    let isCombust = false;
    if (name !== "Sun" && name !== "Rahu" && name !== "Ketu" && dignityInfo.combustionOrb > 0) {
      const angularDiff = Math.abs(((p.siderealLongitude - sunSidereal + 540) % 360) - 180);
      if (angularDiff <= dignityInfo.combustionOrb) {
        isCombust = true;
      }
    }

    let dignityScore: PlanetAnalysis["dignityScore"] = "Neutral";
    if (isExalted) dignityScore = "Exalted";
    else if (isOwnSign) dignityScore = "Own Sign";
    else if (isDebilitated) dignityScore = "Debilitated";

    const house = planetHouseMap[name] ?? 1;

    let desc = `${name} is placed in House ${house} (${p.signName}).`;
    if (isExalted) desc += ` Exalted state, giving heightened potency.`;
    if (isDebilitated) desc += ` In debilitation, requiring mindful expression.`;
    if (isOwnSign) desc += ` In its own domicile sign, granting natural strength.`;
    if (isCombust) desc += ` Within close combustion proximity to the Sun.`;
    if (p.isRetrograde) desc += ` In retrograde (Vakri) motion, indicating deep internalized karmic focus.`;

    analysis[name] = {
      name,
      glyph: p.glyph,
      signName: p.signName,
      house,
      isExalted,
      isDebilitated,
      isOwnSign,
      isCombust,
      isRetrograde: p.isRetrograde,
      dignityScore,
      summaryDescription: desc,
    };
  }

  return analysis;
}

/**
 * Checks for Manglik Dosha, Kalsarpa Dosha, and active Sade Sati phase.
 */
export function analyzeDoshas(
  planets: Record<string, PlanetPosition>,
  planetHouseMap: Record<string, number>,
  currentSaturnSignId?: number, // Sign ID of Saturn currently in the sky (e.g. 11 for Aquarius or 12 for Pisces)
): DoshaAnalysis {
  const marsHouse = planetHouseMap["Mars"] ?? 0;
  const moonHouse = planetHouseMap["Moon"] ?? 0;

  // Manglik Dosha: Mars in 1st, 2nd, 4th, 7th, 8th, or 12th from Lagna
  const manglikHousesLagna = [1, 2, 4, 7, 8, 12];
  const isManglikFromLagna = manglikHousesLagna.includes(marsHouse);

  // Mars from Moon
  const marsFromMoon = ((marsHouse - moonHouse + 12) % 12) + 1;
  const isManglikFromMoon = manglikHousesLagna.includes(marsFromMoon);

  let isManglik = false;
  let manglikSeverity: DoshaAnalysis["manglikSeverity"] = "None";
  let manglikDetails = "Mars is favorably placed with no traditional Kuja Dosha afflictions.";

  if (isManglikFromLagna && isManglikFromMoon) {
    isManglik = true;
    manglikSeverity = "High";
    manglikDetails = `Mars is placed in House ${marsHouse} from Lagna and House ${marsFromMoon} from Moon, indicating double Kuja Dosha.`;
  } else if (isManglikFromLagna || isManglikFromMoon) {
    isManglik = true;
    manglikSeverity = "Moderate";
    const ref = isManglikFromLagna ? `House ${marsHouse} from Lagna` : `House ${marsFromMoon} from Moon`;
    manglikDetails = `Mars is placed in ${ref}, creating mild to moderate Manglik influences.`;
  }

  // Kalsarpa Dosha: All 7 classical planets hemmed between Rahu and Ketu
  const rahuLon = planets["Rahu"]?.siderealLongitude ?? 0;
  const ketuLon = planets["Ketu"]?.siderealLongitude ?? 0;

  const classicalPlanets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  let allInFirstArc = true;
  let allInSecondArc = true;

  for (const name of classicalPlanets) {
    const lon = planets[name]?.siderealLongitude ?? 0;
    // Check if lon is between Rahu and Ketu
    const inFirst = isAngleBetween(lon, rahuLon, ketuLon);
    if (!inFirst) allInFirstArc = false;
    else allInSecondArc = false;
  }

  const hasKalsarpa = allInFirstArc || allInSecondArc;
  let kalsarpaType: string | null = null;
  if (hasKalsarpa) {
    const rahuHouse = planetHouseMap["Rahu"] ?? 1;
    const names = ["Anant", "Kulik", "Vasuki", "Shankhpal", "Padma", "Mahapadma", "Takshak", "Karkotak", "Shankhachur", "Ghatak", "Vishdhar", "Sheshnaag"];
    kalsarpaType = `${names[rahuHouse - 1] || "Sarpa"} Kalsarpa Yoga (Rahu in House ${rahuHouse})`;
  }

  // Sade Sati: Saturn transiting 12th, 1st, or 2nd from Natal Moon Sign
  const moonSignId = planets["Moon"]?.signId ?? 1;
  // If current Saturn sign is not passed, use real-time Saturn's sign
  const saturnSign = currentSaturnSignId ?? (planets["Saturn"]?.signId ?? 11);

  const saturnFromMoon = ((saturnSign - moonSignId + 12) % 12) + 1;
  let sadeSatiActive = false;
  let sadeSatiPhase: DoshaAnalysis["sadeSatiStatus"]["phase"] = "Not Active";
  let sadeSatiDetails = "You are currently not undergoing the 7.5-year Sade Sati cycle of Saturn.";

  if (saturnFromMoon === 12) {
    sadeSatiActive = true;
    sadeSatiPhase = "Rising Phase (12th)";
    sadeSatiDetails = "Saturn is transiting the 12th house from your natal Moon — the early initiation phase of Sade Sati, highlighting restructuring and patience.";
  } else if (saturnFromMoon === 1) {
    sadeSatiActive = true;
    sadeSatiPhase = "Peak Phase (1st)";
    sadeSatiDetails = "Saturn is transiting directly over your natal Moon — the peak phase of Sade Sati, emphasizing discipline, responsibility, and emotional resilience.";
  } else if (saturnFromMoon === 2) {
    sadeSatiActive = true;
    sadeSatiPhase = "Setting Phase (2nd)";
    sadeSatiDetails = "Saturn is transiting the 2nd house from your natal Moon — the concluding setting phase of Sade Sati, bringing financial clarity and mature rewards.";
  }

  return {
    isManglik,
    manglikSeverity,
    manglikDetails,
    hasKalsarpa,
    kalsarpaType,
    sadeSatiStatus: {
      isActive: sadeSatiActive,
      phase: sadeSatiPhase,
      details: sadeSatiDetails,
    },
  };
}

/**
 * Checks for classical Vedic Yogas (combinations for brilliance, wealth, leadership).
 */
export function detectYogas(
  planets: Record<string, PlanetPosition>,
  planetHouseMap: Record<string, number>,
  houses: HouseInfo[],
): YogaFound[] {
  const yogas: YogaFound[] = [];

  const moonHouse = planetHouseMap["Moon"] ?? 0;
  const jupiterHouse = planetHouseMap["Jupiter"] ?? 0;
  const sunHouse = planetHouseMap["Sun"] ?? 0;
  const mercuryHouse = planetHouseMap["Mercury"] ?? 0;
  const marsHouse = planetHouseMap["Mars"] ?? 0;
  const venusHouse = planetHouseMap["Venus"] ?? 0;

  // 1. Gaja Kesari Yoga: Jupiter in Kendra (1, 4, 7, 10) from Moon
  const jupFromMoon = ((jupiterHouse - moonHouse + 12) % 12) + 1;
  if ([1, 4, 7, 10].includes(jupFromMoon)) {
    yogas.push({
      name: "Gaja Kesari Yoga",
      sanskrit: "गजकेसरी योग",
      category: "Auspicious",
      description: "Jupiter forms a powerful angular Kendra with the Moon, bestowing wisdom, reputation, emotional nobility, and enduring respect.",
      planetsInvolved: ["Jupiter", "Moon"],
    });
  }

  // 2. Budhaditya Yoga: Sun and Mercury together in the same house
  if (sunHouse === mercuryHouse && sunHouse > 0) {
    yogas.push({
      name: "Budhaditya Yoga",
      sanskrit: "बुधादित्य योग",
      category: "Intellect",
      description: "Conjunction of the Sun (vitality/soul) and Mercury (intellect/analysis) in the same sign, conferring sharp communication, strategic intellect, and academic talent.",
      planetsInvolved: ["Sun", "Mercury"],
    });
  }

  // 3. Chandra-Mangala Yoga: Moon and Mars conjunct in the same house
  if (moonHouse === marsHouse && moonHouse > 0) {
    yogas.push({
      name: "Chandra Mangala Yoga",
      sanskrit: "चन्द्र-मङ्गल योग",
      category: "Wealth",
      description: "Conjunction of Moon and Mars, granting dynamic enterprise, commercial ambition, passion, and rapid financial drive.",
      planetsInvolved: ["Moon", "Mars"],
    });
  }

  // 4. Malavya Yoga (Pancha Mahapurusha): Venus exalted or in own sign in Kendra (1, 4, 7, 10)
  if ([1, 4, 7, 10].includes(venusHouse)) {
    const venusSign = planets["Venus"]?.signId ?? 0;
    if (venusSign === 12 || venusSign === 2 || venusSign === 7) {
      yogas.push({
        name: "Malavya Mahapurusha Yoga",
        sanskrit: "मालव्य योग",
        category: "Wealth",
        description: "Venus is placed in a Kendra in its own or exaltation sign, bestowing artistic refinement, luxury, charismatic presence, and harmonious relationships.",
        planetsInvolved: ["Venus"],
      });
    }
  }

  return yogas;
}

function isAngleBetween(target: number, start: number, end: number): boolean {
  if (start <= end) {
    return target >= start && target <= end;
  }
  return target >= start || target <= end;
}
