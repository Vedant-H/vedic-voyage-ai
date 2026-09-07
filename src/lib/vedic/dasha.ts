import { TOTAL_VIMSHOTTARI_YEARS, VIMSHOTTARI_CYCLE, type DashaOrder } from "./constants";
import { getNakshatraForLongitude } from "./ephemeris";

export interface AntardashaInfo {
  subLord: string;
  startDate: string; // ISO date string
  endDate: string;
  durationMonths: number;
}

export interface MahadashaInfo {
  lord: string;
  startDate: string;
  endDate: string;
  durationYears: number;
  antardashas: AntardashaInfo[];
}

export interface CurrentDashaState {
  mahadasha: string;
  antardasha: string;
  pratyantardasha: string;
  mahadashaEnd: string;
  antardashaEnd: string;
}

/**
 * Calculates complete Vimshottari Dasha periods based on the Moon's sidereal longitude and birth timestamp.
 */
export function calculateVimshottariDasha(
  moonSiderealLongitude: number,
  birthDate: Date,
  currentDate: Date = new Date(),
): {
  mahadashas: MahadashaInfo[];
  currentDasha: CurrentDashaState | null;
  balanceAtBirth: { lord: string; yearsRemaining: number };
} {
  const { nakshatra } = getNakshatraForLongitude(moonSiderealLongitude);
  const birthLord = nakshatra.ruler;

  // Find index of birth lord in 9-planet Vimshottari cycle
  const cycleIndex = VIMSHOTTARI_CYCLE.findIndex((d) => d.planet === birthLord);
  const activeCycle = cycleIndex !== -1 ? cycleIndex : 0;
  const birthCycleItem = VIMSHOTTARI_CYCLE[activeCycle]!;

  // Moon traversed within its Nakshatra (span is 13.333333°)
  const span = 360 / 27; // 13.333333°
  const degreeInNakshatra = ((moonSiderealLongitude % span) + span) % span;
  const fractionRemaining = (span - degreeInNakshatra) / span;

  // Balance of birth Mahadasha in years
  const balanceYears = fractionRemaining * birthCycleItem.durationYears;

  const mahadashas: MahadashaInfo[] = [];
  let currentCursorMs = birthDate.getTime();

  // Helper to add decimal years to a timestamp
  const addYears = (baseMs: number, years: number): number => {
    return baseMs + years * 365.25 * 24 * 3600 * 1000;
  };

  for (let i = 0; i < 9; i++) {
    const cycleItem = VIMSHOTTARI_CYCLE[(activeCycle + i) % 9]!;
    const dashaYears = i === 0 ? balanceYears : cycleItem.durationYears;
    const startMs = currentCursorMs;
    const endMs = addYears(startMs, dashaYears);

    // Calculate Antardashas for this Mahadasha
    const antardashas: AntardashaInfo[] = [];
    let antardashaCursorMs = startMs;

    // Antardasha sequence begins with the Mahadasha lord itself
    const mahaLordIndex = VIMSHOTTARI_CYCLE.findIndex((c) => c.planet === cycleItem.planet);

    for (let j = 0; j < 9; j++) {
      const subItem = VIMSHOTTARI_CYCLE[(mahaLordIndex + j) % 9]!;
      // Full Antardasha duration in standard years
      const standardAntarYears = (cycleItem.durationYears * subItem.durationYears) / TOTAL_VIMSHOTTARI_YEARS;
      // Proportionally scaled if this is the first (partial) birth dasha
      const scale = dashaYears / cycleItem.durationYears;
      const actualAntarYears = standardAntarYears * scale;

      const subStartMs = antardashaCursorMs;
      const subEndMs = addYears(subStartMs, actualAntarYears);

      antardashas.push({
        subLord: subItem.planet,
        startDate: new Date(subStartMs).toISOString(),
        endDate: new Date(subEndMs).toISOString(),
        durationMonths: Math.round(actualAntarYears * 12 * 10) / 10,
      });

      antardashaCursorMs = subEndMs;
    }

    mahadashas.push({
      lord: cycleItem.planet,
      startDate: new Date(startMs).toISOString(),
      endDate: new Date(endMs).toISOString(),
      durationYears: Math.round(dashaYears * 100) / 100,
      antardashas,
    });

    currentCursorMs = endMs;
  }

  // Determine current active Dasha for the specified date
  const nowMs = currentDate.getTime();
  let currentDasha: CurrentDashaState | null = null;

  for (const md of mahadashas) {
    const mdStart = new Date(md.startDate).getTime();
    const mdEnd = new Date(md.endDate).getTime();

    if (nowMs >= mdStart && nowMs < mdEnd) {
      // Found current Mahadasha
      for (const ad of md.antardashas) {
        const adStart = new Date(ad.startDate).getTime();
        const adEnd = new Date(ad.endDate).getTime();

        if (nowMs >= adStart && nowMs < adEnd) {
          // Approximate Pratyantardasha (Sub-sub lord)
          const antarLordIndex = VIMSHOTTARI_CYCLE.findIndex((c) => c.planet === ad.subLord);
          const antarTotalMs = adEnd - adStart;
          const elapsedInAntar = nowMs - adStart;
          const fractionInAntar = elapsedInAntar / antarTotalMs;
          const pratyantarIndex = Math.min(Math.floor(fractionInAntar * 9), 8);
          const pratyantarLord = VIMSHOTTARI_CYCLE[(antarLordIndex + pratyantarIndex) % 9]!.planet;

          currentDasha = {
            mahadasha: md.lord,
            antardasha: ad.subLord,
            pratyantardasha: pratyantarLord,
            mahadashaEnd: md.endDate,
            antardashaEnd: ad.endDate,
          };
          break;
        }
      }
      break;
    }
  }

  return {
    mahadashas,
    currentDasha,
    balanceAtBirth: {
      lord: birthLord,
      yearsRemaining: Math.round(balanceYears * 100) / 100,
    },
  };
}
