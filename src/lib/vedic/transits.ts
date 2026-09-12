import { calculatePlanetaryPositions, calculateLahiriAyanamsha, dateToJulianDay, type PlanetPosition } from "./ephemeris";
import type { CompleteVedicChart } from "./index";
import { ZODIAC_SIGNS } from "./constants";

export interface TransitPlanetInfo {
  planet: string;
  glyph: string;
  signId: number;
  signName: string;
  signSanskrit: string;
  degreeInSign: number;
  formattedPosition: string;
  isRetrograde: boolean;
  transitHouseFromLagna: number; // 1 to 12
  transitHouseFromMoon: number;  // 1 to 12
  isBeneficTransit: boolean;
  effectSummary: string;
}

export interface GocharaTransitReport {
  timestamp: string;
  transits: Record<string, TransitPlanetInfo>;
  specialEvents: {
    sadeSati: {
      active: boolean;
      phase: "Rising" | "Peak" | "Setting" | "None";
      description: string;
    };
    kantakaShani: {
      active: boolean;
      description: string;
    };
    ashtamaShani: {
      active: boolean;
      description: string;
    };
    jupiterTransit: {
      houseFromMoon: number;
      isFavorable: boolean;
      description: string;
    };
    rahuKetuAxis: {
      rahuHouse: number;
      ketuHouse: number;
      description: string;
    };
  };
}

/**
 * Calculates current real-time Gochara (planetary transits) mapped over a user's natal chart.
 */
export function calculateGocharaTransits(
  natalChart: CompleteVedicChart,
  now: Date = new Date()
): GocharaTransitReport {
  const jd = dateToJulianDay(now);
  const currentAyanamsha = calculateLahiriAyanamsha(jd);
  const currentPlanets = calculatePlanetaryPositions(now, currentAyanamsha);

  const natalLagnaSignId = natalChart.ascendant.signId;
  const natalMoonSignId = natalChart.planets["Moon"]?.signId || 1;

  // Helper to calculate house relative to a reference sign
  const getHouseOffset = (transitSignId: number, refSignId: number): number => {
    return ((transitSignId - refSignId + 12) % 12) + 1;
  };

  const transits: Record<string, TransitPlanetInfo> = {};

  // Standard classical favorable houses from Natal Moon (BPHS Gochara):
  // Sun: 3, 6, 10, 11
  // Moon: 1, 3, 6, 7, 10, 11
  // Mars: 3, 6, 11
  // Mercury: 2, 4, 6, 8, 10, 11
  // Jupiter: 2, 5, 7, 9, 11
  // Venus: 1, 2, 3, 4, 5, 8, 9, 11, 12
  // Saturn: 3, 6, 11
  // Rahu/Ketu: 3, 6, 10, 11
  const BENEFIC_TRANSIT_HOUSES: Record<string, number[]> = {
    Sun: [3, 6, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [3, 6, 11],
    Mercury: [2, 4, 6, 8, 10, 11],
    Jupiter: [2, 5, 7, 9, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Saturn: [3, 6, 11],
    Rahu: [3, 6, 10, 11],
    Ketu: [3, 6, 11],
  };

  for (const [name, p] of Object.entries(currentPlanets)) {
    const houseFromLagna = getHouseOffset(p.signId, natalLagnaSignId);
    const houseFromMoon = getHouseOffset(p.signId, natalMoonSignId);
    const favorableList = BENEFIC_TRANSIT_HOUSES[name] || [3, 6, 11];
    const isBenefic = favorableList.includes(houseFromMoon);

    let summary = `${name} is currently transiting ${p.signName} in your ${houseFromLagna}th house of self/destiny and ${houseFromMoon}th from Moon.`;
    if (name === "Jupiter") {
      summary = isBenefic
        ? `Jupiter casts auspicious rays from ${houseFromMoon}th from Moon, blessing expansion, wisdom, and opportunities.`
        : `Jupiter transits house ${houseFromMoon} from Moon, calling for patient internal spiritual study and disciplined budgeting.`;
    } else if (name === "Saturn") {
      summary = isBenefic
        ? `Saturn in house ${houseFromMoon} from Moon brings steady karmic rewards and disciplined endurance.`
        : `Saturn transits house ${houseFromMoon} from Moon, emphasizing maturity, patience, and karmic refinement.`;
    }

    transits[name] = {
      planet: name,
      glyph: p.glyph,
      signId: p.signId,
      signName: p.signName,
      signSanskrit: p.signSanskrit,
      degreeInSign: p.degreeInSign,
      formattedPosition: p.formattedPosition,
      isRetrograde: p.isRetrograde,
      transitHouseFromLagna: houseFromLagna,
      transitHouseFromMoon: houseFromMoon,
      isBeneficTransit: isBenefic,
      effectSummary: summary,
    };
  }

  // Saturn Transit Assessment
  const saturnTransitHouseFromMoon = transits["Saturn"]?.transitHouseFromMoon || 1;
  let sadeSatiActive = false;
  let sadeSatiPhase: "Rising" | "Peak" | "Setting" | "None" = "None";
  let sadeSatiDesc = "Saturn is not currently transiting 12th, 1st, or 2nd from your natal Moon sign. Sade Sati is inactive.";

  if (saturnTransitHouseFromMoon === 12) {
    sadeSatiActive = true;
    sadeSatiPhase = "Rising";
    sadeSatiDesc = "Saturn is transiting the 12th house from your natal Moon (Rising Phase). Time for internal cleansing, releasing outdated habits, and careful rest.";
  } else if (saturnTransitHouseFromMoon === 1) {
    sadeSatiActive = true;
    sadeSatiPhase = "Peak";
    sadeSatiDesc = "Saturn is transiting directly over your natal Moon sign (Peak Phase). Demands emotional resilience, personal discipline, and focused character building.";
  } else if (saturnTransitHouseFromMoon === 2) {
    sadeSatiActive = true;
    sadeSatiPhase = "Setting";
    sadeSatiDesc = "Saturn is transiting the 2nd house from your natal Moon (Setting Phase). Restructures family finances, speech, and enduring wealth fundamentals.";
  }

  // Kantaka Shani (4th from Moon) & Ashtama Shani (8th from Moon)
  const kantakaShaniActive = saturnTransitHouseFromMoon === 4;
  const kantakaShaniDesc = kantakaShaniActive
    ? "Saturn transits the 4th house from natal Moon (Kantaka Shani). Focus on domestic peace, vehicle care, and maternal well-being."
    : "Kantaka Shani is currently inactive.";

  const ashtamaShaniActive = saturnTransitHouseFromMoon === 8;
  const ashtamaShaniDesc = ashtamaShaniActive
    ? "Saturn transits the 8th house from natal Moon (Ashtama Shani). Avoid sudden speculations, prioritize health, and lean on quiet meditation."
    : "Ashtama Shani is currently inactive.";

  // Jupiter Transit Assessment
  const jupiterHouseFromMoon = transits["Jupiter"]?.transitHouseFromMoon || 1;
  const jupiterFavorable = BENEFIC_TRANSIT_HOUSES["Jupiter"]?.includes(jupiterHouseFromMoon) || false;
  const jupiterDesc = jupiterFavorable
    ? `Jupiter's transit in house ${jupiterHouseFromMoon} from your Moon activates strong cosmic support, grace, and expansion in key endeavors.`
    : `Jupiter transits house ${jupiterHouseFromMoon} from your Moon, encouraging cautious growth, internal study, and ethical alignment.`;

  // Rahu / Ketu Transit Axis
  const rahuHouse = transits["Rahu"]?.transitHouseFromMoon || 1;
  const ketuHouse = transits["Ketu"]?.transitHouseFromMoon || 7;
  const rahuKetuDesc = `The Rahu-Ketu nodal axis spans your ${rahuHouse}th / ${ketuHouse}th houses from Moon, highlighting material ambition vs. spiritual release in those sectors.`;

  return {
    timestamp: now.toISOString(),
    transits,
    specialEvents: {
      sadeSati: {
        active: sadeSatiActive,
        phase: sadeSatiPhase,
        description: sadeSatiDesc,
      },
      kantakaShani: {
        active: kantakaShaniActive,
        description: kantakaShaniDesc,
      },
      ashtamaShani: {
        active: ashtamaShaniActive,
        description: ashtamaShaniDesc,
      },
      jupiterTransit: {
        houseFromMoon: jupiterHouseFromMoon,
        isFavorable: jupiterFavorable,
        description: jupiterDesc,
      },
      rahuKetuAxis: {
        rahuHouse,
        ketuHouse,
        description: rahuKetuDesc,
      },
    },
  };
}
