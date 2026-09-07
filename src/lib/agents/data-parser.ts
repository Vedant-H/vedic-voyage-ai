import type { CompleteVedicChart } from "../vedic";

export interface AstrologicalFactSheet {
  lagnaSign: string;
  lagnaDegree: string;
  lagnaNakshatra: string;
  lagnaLord: string;
  lagnaLordPlacement: { house: number; sign: string; state: string };
  moonSign: string;
  moonNakshatra: string;
  moonPada: number;
  sunSign: string;
  sunNakshatra: string;
  activeDasha: {
    mahadasha: string;
    antardasha: string;
    pratyantardasha: string;
    endDate: string;
  } | null;
  exaltedPlanets: string[];
  debilitatedPlanets: string[];
  ownSignPlanets: string[];
  retrogradePlanets: string[];
  combustPlanets: string[];
  yogasPresent: Array<{ name: string; category: string; description: string }>;
  doshas: {
    isManglik: boolean;
    manglikSeverity: string;
    manglikDetails: string;
    hasKalsarpa: boolean;
    kalsarpaType: string | null;
    sadeSatiActive: boolean;
    sadeSatiPhase: string;
  };
  houseLordSummary: Array<{ house: number; lord: string; placedInHouse: number }>;
}

/**
 * Ephemeris Data Parser Agent:
 * Extracts strictly verified astrological rules and facts from the calculated mathematical chart.
 */
export function parseEphemerisFacts(chart: CompleteVedicChart): AstrologicalFactSheet {
  const { ascendant, planets, analysis, dasha, houses, planetHouseMap } = chart;

  // Find Lagna Lord and its placement
  const lagnaLord = ascendant.signId ? houses[0]?.lord ?? "Mars" : "Mars";
  const lagnaLordPlanet = planets[lagnaLord];
  const lagnaLordHouse = planetHouseMap[lagnaLord] ?? 1;
  const lagnaLordAnalysis = analysis.planets[lagnaLord];

  const lagnaLordPlacement = {
    house: lagnaLordHouse,
    sign: lagnaLordPlanet?.signName ?? ascendant.signName,
    state: lagnaLordAnalysis?.dignityScore ?? "Neutral",
  };

  const exaltedPlanets: string[] = [];
  const debilitatedPlanets: string[] = [];
  const ownSignPlanets: string[] = [];
  const retrogradePlanets: string[] = [];
  const combustPlanets: string[] = [];

  for (const [name, p] of Object.entries(analysis.planets)) {
    if (p.isExalted) exaltedPlanets.push(name);
    if (p.isDebilitated) debilitatedPlanets.push(name);
    if (p.isOwnSign) ownSignPlanets.push(name);
    if (p.isRetrograde) retrogradePlanets.push(name);
    if (p.isCombust) combustPlanets.push(name);
  }

  // House lord placements
  const houseLordSummary = houses.map((h) => {
    const lordPlanet = h.lord;
    const placedInHouse = planetHouseMap[lordPlanet] ?? h.houseNumber;
    return {
      house: h.houseNumber,
      lord: lordPlanet,
      placedInHouse,
    };
  });

  const moon = planets["Moon"];
  const sun = planets["Sun"];

  return {
    lagnaSign: ascendant.signName,
    lagnaDegree: ascendant.formattedPosition,
    lagnaNakshatra: `${ascendant.nakshatra.name} (Pada ${ascendant.pada})`,
    lagnaLord,
    lagnaLordPlacement,
    moonSign: moon ? moon.signName : "Aries",
    moonNakshatra: moon ? moon.nakshatra.name : "Ashwini",
    moonPada: moon ? moon.pada : 1,
    sunSign: sun ? sun.signName : "Aries",
    sunNakshatra: sun ? `${sun.nakshatra.name} (Pada ${sun.pada})` : "Ashwini (Pada 1)",
    activeDasha: dasha.current
      ? {
          mahadasha: dasha.current.mahadasha,
          antardasha: dasha.current.antardasha,
          pratyantardasha: dasha.current.pratyantardasha,
          endDate: dasha.current.antardashaEnd,
        }
      : null,
    exaltedPlanets,
    debilitatedPlanets,
    ownSignPlanets,
    retrogradePlanets,
    combustPlanets,
    yogasPresent: analysis.yogas.map((y) => ({
      name: y.name,
      category: y.category,
      description: y.description,
    })),
    doshas: {
      isManglik: analysis.doshas.isManglik,
      manglikSeverity: analysis.doshas.manglikSeverity,
      manglikDetails: analysis.doshas.manglikDetails,
      hasKalsarpa: analysis.doshas.hasKalsarpa,
      kalsarpaType: analysis.doshas.kalsarpaType,
      sadeSatiActive: analysis.doshas.sadeSatiStatus.isActive,
      sadeSatiPhase: analysis.doshas.sadeSatiStatus.phase,
    },
    houseLordSummary,
  };
}
