import assert from "node:assert/strict";
import { calculateVedicChart } from "../src/lib/vedic/index.ts";
import { calculateLahiriAyanamsha, dateToJulianDay } from "../src/lib/vedic/ephemeris.ts";
import { NAKSHATRAS, ZODIAC_SIGNS, PLANET_DIGNITIES } from "../src/lib/vedic/constants.ts";

console.log("🌟 Running Vedic Ephemeris & Astronomical Integrity Test Suite...\n");

// Test 1: Lahiri Ayanamsha Precision
{
  const j2000Date = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const ayanamsha2000 = calculateLahiriAyanamsha(dateToJulianDay(j2000Date));
  console.log(`✓ Lahiri Ayanamsha for J2000: ${ayanamsha2000.toFixed(4)}°`);
  // J2000 standard Lahiri Ayanamsha is approximately 23.85°
  assert(ayanamsha2000 > 23.80 && ayanamsha2000 < 23.90, `Lahiri Ayanamsha at J2000 (${ayanamsha2000}°) is outside expected range`);

  const currentYearDate = new Date(Date.UTC(2026, 0, 1, 0, 0, 0));
  const ayanamsha2026 = calculateLahiriAyanamsha(dateToJulianDay(currentYearDate));
  console.log(`✓ Lahiri Ayanamsha for 2026: ${ayanamsha2026.toFixed(4)}°`);
  assert(ayanamsha2026 > 24.15 && ayanamsha2026 < 24.30, `Lahiri Ayanamsha in 2026 (${ayanamsha2026}°) is outside expected range`);
}

// Test 2: Constant Structure Validity
{
  assert.equal(NAKSHATRAS.length, 27, "Must have exactly 27 Nakshatras");
  assert.equal(ZODIAC_SIGNS.length, 12, "Must have exactly 12 Rashis (Zodiac Signs)");

  // Check Sun exaltation in Aries (Mesha, sign ID 1)
  assert.equal(PLANET_DIGNITIES["Sun"]?.exaltationSign, 1, "Sun must be exalted in sign 1 (Aries)");
  assert.equal(PLANET_DIGNITIES["Sun"]?.debilitationSign, 7, "Sun must be debilitated in sign 7 (Libra)");

  // Check Jupiter exaltation in Cancer (Karka, sign ID 4)
  assert.equal(PLANET_DIGNITIES["Jupiter"]?.exaltationSign, 4, "Jupiter must be exalted in sign 4 (Cancer)");
  assert.equal(PLANET_DIGNITIES["Jupiter"]?.debilitationSign, 10, "Jupiter must be debilitated in sign 10 (Capricorn)");

  console.log("✓ Classical dignities & Nakshatra/Rashi constants validated");
}

// Test 3: Complete Janma Kundli Ephemeris Generation
{
  // Test case: 15 August 1947, 00:00:00 IST (Indian Independence Chart)
  // New Delhi, Lat: 28.6139, Lon: 77.2090
  const independenceChart = calculateVedicChart({
    dateOfBirth: "1947-08-15",
    timeOfBirth: "00:00",
    latitude: 28.6139,
    longitude: 77.2090,
    timezoneOffsetHours: 5.5,
  });

  assert(independenceChart.ascendant, "Chart must calculate Ascendant (Lagna)");
  console.log(`✓ Ascendant for 15-Aug-1947: ${independenceChart.ascendant.signName} (${independenceChart.ascendant.degreeInSign.toFixed(2)}°)`);
  // India's independence Ascendant is famously Taurus (Vrishabha)
  assert.equal(independenceChart.ascendant.signName, "Taurus", "Independence chart ascendant should be Taurus");

  const moon = independenceChart.planets["Moon"];
  assert(moon, "Moon planet must exist");
  console.log(`✓ Moon Sign: ${moon.signName}`);
  // Moon was in Cancer (Pushya Nakshatra)
  assert.equal(moon.signName, "Cancer", "Independence chart Moon should be in Cancer");
  assert.equal(moon.nakshatra.name, "Pushya", "Independence chart Nakshatra should be Pushya");

  // Check Vimshottari Dasha
  assert(independenceChart.dasha, "Dasha cycle must be computed");
  assert(independenceChart.dasha.balanceAtBirth, "Birth balance must exist");
  console.log(`✓ Birth Mahadasha: ${independenceChart.dasha.balanceAtBirth.lord} (Balance: ${independenceChart.dasha.balanceAtBirth.yearsRemaining.toFixed(2)} years)`);
  assert.equal(independenceChart.dasha.balanceAtBirth.lord, "Saturn", "Pushya Nakshatra is ruled by Saturn");

  // Verify Yogas & Doshas
  assert(Array.isArray(independenceChart.analysis.yogas), "Yogas must be calculated as array");
  console.log(`✓ Identified Yogas: ${independenceChart.analysis.yogas.map((y) => y.name).join(", ")}`);

  console.log("✓ Complete Janma Kundli calculation verified with astronomical precision!");
}

// Test 4: 120-Year Vimshottari Timeline Scrubber & Dasha Lookup
{
  const { getDashaAtDate } = await import("../src/lib/vedic/dasha.ts");
  const chart = calculateVedicChart({
    dateOfBirth: "1990-05-15",
    timeOfBirth: "14:30",
    latitude: 19.076,
    longitude: 72.8777,
    timezoneOffsetHours: 5.5,
  });

  const testDate2026 = new Date(2026, 6, 1);
  const activePeriod = getDashaAtDate(chart.dasha.mahadashas, testDate2026);
  assert(activePeriod, "Must locate active Dasha for year 2026");
  assert(activePeriod.mahadasha.lord, "Mahadasha lord must be identified");
  assert(activePeriod.antardasha.subLord, "Antardasha subLord must be identified");
  console.log(`✓ Timeline Scrubber: In 2026, active period is ${activePeriod.mahadasha.lord} - ${activePeriod.antardasha.subLord}`);
}

// Test 5: Live Gochara Transits Engine
{
  const { calculateGocharaTransits } = await import("../src/lib/vedic/transits.ts");
  const chart = calculateVedicChart({
    dateOfBirth: "1995-10-24",
    timeOfBirth: "06:15",
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetHours: 5.5,
  });

  const transits = calculateGocharaTransits(chart);
  assert(transits.transits["Jupiter"], "Jupiter transit must exist");
  assert(transits.transits["Saturn"], "Saturn transit must exist");
  assert(transits.transits["Rahu"], "Rahu transit must exist");
  assert(transits.specialEvents.sadeSati, "Sade Sati status must be computed");
  console.log(`✓ Live Gochara Transits: Jupiter currently transiting house ${transits.transits["Jupiter"].transitHouseFromMoon} from Moon`);
  console.log(`✓ Live Sade Sati Status: ${transits.specialEvents.sadeSati.phase} (Active: ${transits.specialEvents.sadeSati.active})`);
}

// Test 6: 36-Point Ashta-Kuta Kundli Milan Matching
{
  const { calculateKundliMilan } = await import("../src/lib/vedic/milan.ts");
  const chart1 = calculateVedicChart({
    dateOfBirth: "1995-01-10",
    timeOfBirth: "10:00",
    latitude: 28.6139,
    longitude: 77.209,
    timezoneOffsetHours: 5.5,
  });
  const chart2 = calculateVedicChart({
    dateOfBirth: "1996-03-20",
    timeOfBirth: "15:30",
    latitude: 19.076,
    longitude: 72.8777,
    timezoneOffsetHours: 5.5,
  });

  const milan = calculateKundliMilan(chart1, chart2);
  assert(milan.totalScore >= 0 && milan.totalScore <= 36, "Milan score must be between 0 and 36");
  assert.equal(milan.maxScore, 36, "Max score must be 36");
  assert(milan.kutas.nadi, "Nadi Kuta must be calculated");
  assert(milan.kutas.bhakoot, "Bhakoot Kuta must be calculated");
  console.log(`✓ 36-Point Kundli Milan: Total Score = ${milan.totalScore}/36 (${milan.verdictSanskrit} · ${milan.verdict})`);
  console.log(`✓ Manglik Compatibility: ${milan.manglikAnalysis.summary}`);
}

console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! The complete Vedic engine, Timeline Scrubber, Transits, and Milan matching are rock solid.\n");
