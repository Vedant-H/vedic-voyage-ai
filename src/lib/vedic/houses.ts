import { ZODIAC_SIGNS } from "./constants";
import type { AscendantPosition, PlanetPosition } from "./ephemeris";

export interface HouseInfo {
  houseNumber: number; // 1 to 12
  signId: number; // 1 to 12
  signName: string;
  signSanskrit: string;
  lord: string; // Ruling planet
  planets: PlanetPosition[];
  startDegree: number;
  midDegree: number;
  endDegree: number;
}

/**
 * Calculates the 12 Houses (Bhavas).
 * In classical Parashari Jyotish, the Janma Kundli (D1 Rashi Chart) follows the Whole Sign House system:
 * The sign containing the Ascendant is the 1st House, the next sign is the 2nd House, and so on.
 * Also computes exact Bhava Chalit midpoint and spans.
 */
export function calculateHouses(
  ascendant: AscendantPosition,
  planets: Record<string, PlanetPosition>,
): HouseInfo[] {
  const lagnaSignId = ascendant.signId; // 1 to 12

  const houses: HouseInfo[] = [];

  for (let h = 1; h <= 12; h++) {
    // Whole sign calculation: House 1 = Lagna sign, House 2 = (Lagna sign) + 1, etc.
    const signId = ((lagnaSignId - 1 + (h - 1)) % 12) + 1;
    const signInfo = ZODIAC_SIGNS[signId - 1]!;

    // Bhava Chalit cusp: Midpoint is exact Lagna degree in this sign
    const midDegree = ((signId - 1) * 30 + ascendant.degreeInSign) % 360;
    const startDegree = (midDegree - 15 + 360) % 360;
    const endDegree = (midDegree + 15) % 360;

    houses.push({
      houseNumber: h,
      signId: signInfo.id,
      signName: signInfo.name,
      signSanskrit: signInfo.sanskrit,
      lord: signInfo.ruler,
      planets: [],
      startDegree,
      midDegree,
      endDegree,
    });
  }

  // Populate planets into whole-sign houses
  for (const planet of Object.values(planets)) {
    const planetSignId = planet.signId; // 1 to 12
    // Calculate which house this sign corresponds to relative to Lagna
    const houseNumber = ((planetSignId - lagnaSignId + 12) % 12) + 1;
    const targetHouse = houses[houseNumber - 1];
    if (targetHouse) {
      targetHouse.planets.push(planet);
    }
  }

  return houses;
}

/**
 * Returns which house (1-12) each planet is currently placed in.
 */
export function getPlanetHouseMap(
  ascendant: AscendantPosition,
  planets: Record<string, PlanetPosition>,
): Record<string, number> {
  const lagnaSignId = ascendant.signId;
  const map: Record<string, number> = {};

  for (const [name, p] of Object.entries(planets)) {
    map[name] = ((p.signId - lagnaSignId + 12) % 12) + 1;
  }
  return map;
}
