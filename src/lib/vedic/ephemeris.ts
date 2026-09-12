import * as Astronomy from "astronomy-engine";
import { NAKSHATRAS, ZODIAC_SIGNS, type NakshatraInfo, type ZodiacSignInfo } from "./constants";

export interface PlanetPosition {
  name: string;
  glyph: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  signId: number;
  signName: string;
  signSanskrit: string;
  degreeInSign: number;
  formattedPosition: string; // e.g., "14° 23' 12\""
  nakshatra: NakshatraInfo;
  pada: number; // 1 to 4
  speed: number; // degrees per day
  isRetrograde: boolean;
}

export interface AscendantPosition {
  siderealLongitude: number;
  signId: number;
  signName: string;
  signSanskrit: string;
  degreeInSign: number;
  formattedPosition: string;
  nakshatra: NakshatraInfo;
  pada: number;
}

const JD_J2000 = 2451545.0;

/**
 * Calculates Julian Day number from a JavaScript Date.
 */
export function dateToJulianDay(date: Date): number {
  return date.getTime() / 86400000.0 + 2440587.5;
}

/**
 * Computes exact Lahiri Ayanamsha (Chitra Paksha) for a given Julian Day.
 * Reference: Calendar Reform Committee / NC Lahiri standard.
 * Base value at J2000.0: 23° 51' 25.53" = 23.85694°
 * Precession rate: ~50.29 arcsec/year (1.3960416° per century)
 */
export function calculateLahiriAyanamsha(jd: number): number {
  const T = (jd - JD_J2000) / 36525.0;
  const ayanamsha = 23.85694 + 1.3960416 * T + 0.000308 * T * T;
  return ayanamsha;
}

/** Formats a decimal degree into degrees, minutes, seconds string */
export function formatDegreeDMS(deg: number): string {
  const d = Math.floor(deg);
  const mDec = (deg - d) * 60;
  const m = Math.floor(mDec);
  const s = Math.round((mDec - m) * 60);
  return `${d}° ${m.toString().padStart(2, "0")}' ${s.toString().padStart(2, "0")}"`;
}

/** Given a sidereal longitude (0-360), returns the corresponding Zodiac sign info and degree */
export function getZodiacSignForLongitude(deg: number): { sign: ZodiacSignInfo; degreeInSign: number } {
  const norm = ((deg % 360) + 360) % 360;
  const signIndex = Math.min(Math.floor(norm / 30), 11);
  const sign = ZODIAC_SIGNS[signIndex]!;
  const degreeInSign = norm - signIndex * 30;
  return { sign, degreeInSign };
}

/** Given a sidereal longitude (0-360), returns Nakshatra and Pada (1-4) */
export function getNakshatraForLongitude(deg: number): { nakshatra: NakshatraInfo; pada: number } {
  const norm = ((deg % 360) + 360) % 360;
  const span = 360 / 27; // 13.333333°
  const nakshatraIndex = Math.min(Math.floor(norm / span), 26);
  const nakshatra = NAKSHATRAS[nakshatraIndex]!;
  const degreeInNakshatra = norm - nakshatraIndex * span;
  const padaSpan = span / 4; // 3.333333°
  const pada = Math.min(Math.floor(degreeInNakshatra / padaSpan) + 1, 4);
  return { nakshatra, pada };
}

/**
 * Calculates Sidereal Ascendant (Lagna) for given UTC Date and Geographic Coordinates.
 */
export function calculateAscendant(
  date: Date,
  latitude: number,
  longitude: number,
  ayanamsha: number,
): AscendantPosition {
  const time = Astronomy.MakeTime(date);
  const gstHours = Astronomy.SiderealTime(time);
  const lstDeg = ((gstHours * 15.0 + longitude) % 360.0 + 360.0) % 360.0;

  const rad = Math.PI / 180;
  const eps = 23.4392911 * rad; // Obliquity of ecliptic
  const phi = latitude * rad;
  const theta = lstDeg * rad;

  const y = Math.cos(theta);
  const x = -Math.sin(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);
  let tropicalAsc = Math.atan2(y, x) / rad;
  if (tropicalAsc < 0) tropicalAsc += 360;

  const siderealAsc = ((tropicalAsc - ayanamsha) % 360 + 360) % 360;
  const { sign, degreeInSign } = getZodiacSignForLongitude(siderealAsc);
  const { nakshatra, pada } = getNakshatraForLongitude(siderealAsc);

  return {
    siderealLongitude: siderealAsc,
    signId: sign.id,
    signName: sign.name,
    signSanskrit: sign.sanskrit,
    degreeInSign,
    formattedPosition: formatDegreeDMS(degreeInSign),
    nakshatra,
    pada,
  };
}

/**
 * Calculates mean longitude of Moon's ascending node (Rahu in Vedic).
 * Ketu is exactly Rahu + 180°.
 */
function calculateMeanRahu(jd: number): number {
  const T = (jd - JD_J2000) / 36525.0;
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  omega = ((omega % 360) + 360) % 360;
  return omega;
}

/**
 * Calculates sidereal positions for all 9 Grahas (Navagrahas).
 */
export function calculatePlanetaryPositions(date: Date, ayanamsha: number): Record<string, PlanetPosition> {
  const time = Astronomy.MakeTime(date);
  const jd = dateToJulianDay(date);

  // Time delta of +1 hour to evaluate retrograde motion & speed
  const timeDelta = Astronomy.MakeTime(new Date(date.getTime() + 3600000));

  const planetBodies: Array<{ name: string; glyph: string; body: Astronomy.Body }> = [
    { name: "Sun", glyph: "☉", body: Astronomy.Body.Sun },
    { name: "Moon", glyph: "☽", body: Astronomy.Body.Moon },
    { name: "Mars", glyph: "♂", body: Astronomy.Body.Mars },
    { name: "Mercury", glyph: "☿", body: Astronomy.Body.Mercury },
    { name: "Jupiter", glyph: "♃", body: Astronomy.Body.Jupiter },
    { name: "Venus", glyph: "♀", body: Astronomy.Body.Venus },
    { name: "Saturn", glyph: "♄", body: Astronomy.Body.Saturn },
  ];

  const results: Record<string, PlanetPosition> = {};

  for (const item of planetBodies) {
    let tropLon: number;
    let tropLonDelta: number;

    if (item.name === "Moon") {
      const moonEcl = Astronomy.EclipticGeoMoon(time);
      const moonEclDelta = Astronomy.EclipticGeoMoon(timeDelta);
      tropLon = moonEcl.lon;
      tropLonDelta = moonEclDelta.lon;
    } else {
      const vec = Astronomy.GeoVector(item.body, time, true);
      const ecl = Astronomy.Ecliptic(vec);
      tropLon = ecl.elon;

      const vecDelta = Astronomy.GeoVector(item.body, timeDelta, true);
      const eclDelta = Astronomy.Ecliptic(vecDelta);
      tropLonDelta = eclDelta.elon;
    }

    const siderealLon = ((tropLon - ayanamsha) % 360 + 360) % 360;
    const diff = (tropLonDelta - tropLon + 540) % 360 - 180;
    const speedPerDay = diff * 24.0;
    const isRetrograde = item.name === "Sun" || item.name === "Moon" ? false : speedPerDay < 0;

    const { sign, degreeInSign } = getZodiacSignForLongitude(siderealLon);
    const { nakshatra, pada } = getNakshatraForLongitude(siderealLon);

    results[item.name] = {
      name: item.name,
      glyph: item.glyph,
      tropicalLongitude: tropLon,
      siderealLongitude: siderealLon,
      signId: sign.id,
      signName: sign.name,
      signSanskrit: sign.sanskrit,
      degreeInSign,
      formattedPosition: formatDegreeDMS(degreeInSign),
      nakshatra,
      pada,
      speed: speedPerDay,
      isRetrograde,
    };
  }

  // Rahu (Mean Lunar North Node)
  const rahuTrop = calculateMeanRahu(jd);
  const rahuTropDelta = calculateMeanRahu(jd + 1.0 / 24.0);
  const rahuSidereal = ((rahuTrop - ayanamsha) % 360 + 360) % 360;
  const rahuSpeed = ((rahuTropDelta - rahuTrop + 540) % 360 - 180) * 24.0;
  const { sign: rahuSign, degreeInSign: rahuDeg } = getZodiacSignForLongitude(rahuSidereal);
  const { nakshatra: rahuNak, pada: rahuPada } = getNakshatraForLongitude(rahuSidereal);

  results["Rahu"] = {
    name: "Rahu",
    glyph: "☊",
    tropicalLongitude: rahuTrop,
    siderealLongitude: rahuSidereal,
    signId: rahuSign.id,
    signName: rahuSign.name,
    signSanskrit: rahuSign.sanskrit,
    degreeInSign: rahuDeg,
    formattedPosition: formatDegreeDMS(rahuDeg),
    nakshatra: rahuNak,
    pada: rahuPada,
    speed: rahuSpeed,
    isRetrograde: true, // Nodes are always in retrograde motion in mean calculation
  };

  // Ketu (Mean Lunar South Node = Rahu + 180°)
  const ketuSidereal = (rahuSidereal + 180) % 360;
  const ketuTrop = (rahuTrop + 180) % 360;
  const { sign: ketuSign, degreeInSign: ketuDeg } = getZodiacSignForLongitude(ketuSidereal);
  const { nakshatra: ketuNak, pada: ketuPada } = getNakshatraForLongitude(ketuSidereal);

  results["Ketu"] = {
    name: "Ketu",
    glyph: "☋",
    tropicalLongitude: ketuTrop,
    siderealLongitude: ketuSidereal,
    signId: ketuSign.id,
    signName: ketuSign.name,
    signSanskrit: ketuSign.sanskrit,
    degreeInSign: ketuDeg,
    formattedPosition: formatDegreeDMS(ketuDeg),
    nakshatra: ketuNak,
    pada: ketuPada,
    speed: rahuSpeed,
    isRetrograde: true,
  };

  return results;
}
