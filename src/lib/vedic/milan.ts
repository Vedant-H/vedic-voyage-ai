import { NAKSHATRAS, ZODIAC_SIGNS } from "./constants";
import type { CompleteVedicChart } from "./index";

export interface KutaScore {
  name: string;
  sanskrit: string;
  pointsReceived: number;
  maxPoints: number;
  status: "Full" | "Partial" | "Dosha";
  description: string;
}

export interface KundliMilanResult {
  totalScore: number;
  maxScore: 36;
  percentage: number;
  verdict: "Excellent" | "Good & Compatible" | "Challenging / Remedial Guidance Advised";
  verdictSanskrit: "Uttama" | "Madhyama" | "Adhama";
  kutas: {
    varna: KutaScore;
    vashya: KutaScore;
    tara: KutaScore;
    yoni: KutaScore;
    grahaMaitri: KutaScore;
    gana: KutaScore;
    bhakoot: KutaScore;
    nadi: KutaScore;
  };
  manglikAnalysis: {
    isCompatible: boolean;
    partner1Manglik: boolean;
    partner2Manglik: boolean;
    summary: string;
  };
  synthesis: {
    strengths: string[];
    cautions: string[];
    remedialAdvice: string[];
  };
}

// 1. Varna Mapping (Water = Brahmin, Fire = Kshatriya, Earth = Vaishya, Air = Shudra)
const SIGN_VARNA: Record<number, number> = {
  4: 4, 8: 4, 12: 4, // Brahmin (Water: Cancer, Scorpio, Pisces)
  1: 3, 5: 3, 9: 3,  // Kshatriya (Fire: Aries, Leo, Sagittarius)
  2: 2, 6: 2, 10: 2, // Vaishya (Earth: Taurus, Virgo, Capricorn)
  3: 1, 7: 1, 11: 1, // Shudra (Air: Gemini, Libra, Aquarius)
};

// 6. Gana Mapping (Deva = 1, Manushya = 2, Rakshasa = 3)
const NAKSHATRA_GANA: Record<number, "Deva" | "Manushya" | "Rakshasa"> = {
  1: "Deva", 2: "Manushya", 3: "Rakshasa", 4: "Manushya", 5: "Deva", 6: "Manushya",
  7: "Deva", 8: "Deva", 9: "Rakshasa", 10: "Rakshasa", 11: "Manushya", 12: "Manushya",
  13: "Deva", 14: "Rakshasa", 15: "Deva", 16: "Rakshasa", 17: "Deva", 18: "Rakshasa",
  19: "Rakshasa", 20: "Manushya", 21: "Manushya", 22: "Deva", 23: "Rakshasa",
  24: "Rakshasa", 25: "Manushya", 26: "Manushya", 27: "Deva",
};

// 8. Nadi Mapping (Aadi = 1, Madhya = 2, Antya = 3)
const NAKSHATRA_NADI: Record<number, "Aadi" | "Madhya" | "Antya"> = {
  1: "Aadi", 2: "Madhya", 3: "Antya", 4: "Antya", 5: "Madhya", 6: "Aadi",
  7: "Aadi", 8: "Madhya", 9: "Antya", 10: "Antya", 11: "Madhya", 12: "Aadi",
  13: "Aadi", 14: "Madhya", 15: "Antya", 16: "Antya", 17: "Madhya", 18: "Aadi",
  19: "Aadi", 20: "Madhya", 21: "Antya", 22: "Antya", 23: "Madhya", 24: "Aadi",
  25: "Aadi", 26: "Madhya", 27: "Antya",
};

// 4. Yoni Animal Mapping
const NAKSHATRA_YONI: Record<number, string> = {
  1: "Horse", 2: "Elephant", 3: "Sheep", 4: "Serpent", 5: "Serpent", 6: "Dog",
  7: "Cat", 8: "Sheep", 9: "Cat", 10: "Rat", 11: "Rat", 12: "Cow",
  13: "Buffalo", 14: "Tiger", 15: "Buffalo", 16: "Tiger", 17: "Deer", 18: "Deer",
  19: "Dog", 20: "Monkey", 21: "Mongoose", 22: "Monkey", 23: "Lion",
  24: "Horse", 25: "Lion", 26: "Cow", 27: "Elephant",
};

// Natural Animal Enemies (0 points if paired)
const YONI_ENEMIES: Record<string, string> = {
  Horse: "Buffalo", Buffalo: "Horse",
  Elephant: "Lion", Lion: "Elephant",
  Sheep: "Monkey", Monkey: "Sheep",
  Serpent: "Mongoose", Mongoose: "Serpent",
  Dog: "Deer", Deer: "Dog",
  Cat: "Rat", Rat: "Cat",
  Cow: "Tiger", Tiger: "Cow",
};

// Planetary Friendship Matrix (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
const PLANET_RELATIONS: Record<string, { friends: string[]; enemies: string[] }> = {
  Sun: { friends: ["Moon", "Mars", "Jupiter"], enemies: ["Venus", "Saturn"] },
  Moon: { friends: ["Sun", "Mercury"], enemies: [] },
  Mars: { friends: ["Sun", "Moon", "Jupiter"], enemies: ["Mercury"] },
  Mercury: { friends: ["Sun", "Venus"], enemies: ["Moon"] },
  Jupiter: { friends: ["Sun", "Moon", "Mars"], enemies: ["Mercury", "Venus"] },
  Venus: { friends: ["Mercury", "Saturn"], enemies: ["Sun", "Moon"] },
  Saturn: { friends: ["Mercury", "Venus"], enemies: ["Sun", "Moon", "Mars"] },
};

export function calculateKundliMilan(
  chart1: CompleteVedicChart,
  chart2: CompleteVedicChart
): KundliMilanResult {
  const moon1 = chart1.planets["Moon"];
  const moon2 = chart2.planets["Moon"];

  const nak1 = moon1?.nakshatra.id || 1;
  const nak2 = moon2?.nakshatra.id || 1;
  const rashi1 = moon1?.signId || 1;
  const rashi2 = moon2?.signId || 1;

  const ruler1 = ZODIAC_SIGNS[rashi1 - 1]!.ruler;
  const ruler2 = ZODIAC_SIGNS[rashi2 - 1]!.ruler;

  // 1. VARNA KUTA (1 pt)
  const v1 = SIGN_VARNA[rashi1] || 1;
  const v2 = SIGN_VARNA[rashi2] || 1;
  let varnaPts = 0;
  if (v1 >= v2 || v1 === v2) {
    varnaPts = 1;
  }
  const varna: KutaScore = {
    name: "Varna",
    sanskrit: "वर्ण कूट",
    pointsReceived: varnaPts,
    maxPoints: 1,
    status: varnaPts === 1 ? "Full" : "Dosha",
    description: varnaPts === 1
      ? "Spiritual egos, life aspirations, and fundamental values align naturally."
      : "Slight difference in core temperament; cultivate mutual respect for each other's lifestyle.",
  };

  // 2. VASHYA KUTA (2 pts)
  let vashyaPts = 1;
  if (rashi1 === rashi2) {
    vashyaPts = 2;
  } else if (
    (rashi1 === 1 && rashi2 === 5) || (rashi1 === 5 && rashi2 === 1) ||
    (rashi1 === 4 && rashi2 === 8) || (rashi1 === 8 && rashi2 === 4) ||
    (rashi1 === 2 && rashi2 === 7) || (rashi1 === 7 && rashi2 === 2)
  ) {
    vashyaPts = 2;
  }
  const vashya: KutaScore = {
    name: "Vashya",
    sanskrit: "वश्य कूट",
    pointsReceived: vashyaPts,
    maxPoints: 2,
    status: vashyaPts === 2 ? "Full" : "Partial",
    description: vashyaPts === 2
      ? "Strong mutual attraction and natural willingness to support each other."
      : "Harmonious balance of mutual autonomy and influence.",
  };

  // 3. TARA KUTA (3 pts)
  const diff1 = ((nak2 - nak1 + 27) % 9) || 9;
  const diff2 = ((nak1 - nak2 + 27) % 9) || 9;
  const inauspicious = [3, 5, 7]; // Vipat, Pratyak, Naidhana
  const t1Bad = inauspicious.includes(diff1);
  const t2Bad = inauspicious.includes(diff2);

  let taraPts = 3;
  if (t1Bad && t2Bad) taraPts = 0;
  else if (t1Bad || t2Bad) taraPts = 1.5;

  const tara: KutaScore = {
    name: "Tara",
    sanskrit: "तारा कूट",
    pointsReceived: taraPts,
    maxPoints: 3,
    status: taraPts === 3 ? "Full" : taraPts > 0 ? "Partial" : "Dosha",
    description: taraPts === 3
      ? "Birth stars resonate auspiciously, conferring longevity, fortune, and mutual well-being."
      : taraPts > 0
      ? "Moderate destiny connection; mutual patience during difficult planetary transits is key."
      : "Tara friction present; regular spiritual mindfulness and shared charitable deeds are recommended.",
  };

  // 4. YONI KUTA (4 pts)
  const yoni1 = NAKSHATRA_YONI[nak1] || "Deer";
  const yoni2 = NAKSHATRA_YONI[nak2] || "Deer";
  let yoniPts = 2;
  if (yoni1 === yoni2) {
    yoniPts = 4;
  } else if (YONI_ENEMIES[yoni1] === yoni2) {
    yoniPts = 0;
  } else {
    yoniPts = 3;
  }
  const yoni: KutaScore = {
    name: "Yoni",
    sanskrit: "योनि कूट",
    pointsReceived: yoniPts,
    maxPoints: 4,
    status: yoniPts === 4 ? "Full" : yoniPts > 0 ? "Partial" : "Dosha",
    description: yoniPts >= 3
      ? `High biological harmony and instinctual affection (${yoni1} & ${yoni2}).`
      : yoniPts > 0
      ? `Neutral physical affinity (${yoni1} & ${yoni2}); emotional connection bridges natural differences.`
      : `Opposing instinctual archetypes (${yoni1} & ${yoni2}); conscious intimacy and tenderness nurture the bond.`,
  };

  // 5. GRAHA MAITRI KUTA (5 pts)
  let maitriPts = 3;
  if (ruler1 === ruler2) {
    maitriPts = 5;
  } else {
    const r1Rel = PLANET_RELATIONS[ruler1];
    const r2Rel = PLANET_RELATIONS[ruler2];
    const isFriend1 = r1Rel?.friends.includes(ruler2);
    const isEnemy1 = r1Rel?.enemies.includes(ruler2);
    const isFriend2 = r2Rel?.friends.includes(ruler1);
    const isEnemy2 = r2Rel?.enemies.includes(ruler1);

    if (isFriend1 && isFriend2) maitriPts = 5;
    else if ((isFriend1 && !isEnemy2) || (isFriend2 && !isEnemy1)) maitriPts = 4;
    else if (!isEnemy1 && !isEnemy2) maitriPts = 3;
    else if (isEnemy1 && isEnemy2) maitriPts = 0;
    else maitriPts = 1;
  }
  const grahaMaitri: KutaScore = {
    name: "Graha Maitri",
    sanskrit: "ग्रह मैत्री कूट",
    pointsReceived: maitriPts,
    maxPoints: 5,
    status: maitriPts >= 4 ? "Full" : maitriPts > 0 ? "Partial" : "Dosha",
    description: maitriPts >= 4
      ? `Planetary lords (${ruler1} and ${ruler2}) are intimate friends, ensuring deep intellectual comradeship and easy communication.`
      : maitriPts > 0
      ? `Moderate friendship between rulers (${ruler1} & ${ruler2}); open conversations resolve differing perspectives.`
      : `Contrasting mental polarities (${ruler1} vs ${ruler2}); practice listening without debate.`,
  };

  // 6. GANA KUTA (6 pts)
  const gana1 = NAKSHATRA_GANA[nak1] || "Deva";
  const gana2 = NAKSHATRA_GANA[nak2] || "Deva";
  let ganaPts = 0;
  if (gana1 === gana2) {
    ganaPts = 6;
  } else if ((gana1 === "Deva" && gana2 === "Manushya") || (gana1 === "Manushya" && gana2 === "Deva")) {
    ganaPts = 5;
  } else if (gana1 === "Rakshasa" || gana2 === "Rakshasa") {
    // Cancellation if Rashi lords are same or friends
    ganaPts = maitriPts >= 4 ? 3 : 0;
  }
  const gana: KutaScore = {
    name: "Gana",
    sanskrit: "गण कूट",
    pointsReceived: ganaPts,
    maxPoints: 6,
    status: ganaPts >= 5 ? "Full" : ganaPts > 0 ? "Partial" : "Dosha",
    description: ganaPts >= 5
      ? `Temperaments blend harmoniously (${gana1} and ${gana2}), fostering peace and mutual lifestyle habits.`
      : ganaPts > 0
      ? `Different energetic temperaments (${gana1} & ${gana2}), mitigated by planetary goodwill.`
      : `High energetic variance (${gana1} vs ${gana2}); give each other individual space and avoid dominating tendencies.`,
  };

  // 7. BHAKOOT KUTA (7 pts)
  const rashiDiff = Math.abs(rashi1 - rashi2);
  const relativeOffset = ((rashi2 - rashi1 + 12) % 12) + 1;
  const isBadBhakoot = [2, 12, 6, 8, 5, 9].includes(relativeOffset);
  let bhakootPts = 7;
  if (isBadBhakoot) {
    // Cancellation if lords are same (e.g. Aries-Scorpio, Taurus-Libra) or friends
    if (ruler1 === ruler2 || maitriPts >= 4) {
      bhakootPts = 7; // Bhakoot Dosha cancelled
    } else {
      bhakootPts = 0;
    }
  }
  const bhakoot: KutaScore = {
    name: "Bhakoot",
    sanskrit: "भकूट कूट",
    pointsReceived: bhakootPts,
    maxPoints: 7,
    status: bhakootPts === 7 ? "Full" : "Dosha",
    description: bhakootPts === 7
      ? "Mutual Moon placements promise emotional prosperity, family happiness, and joint financial growth."
      : "Bhakoot tension present; requires transparent financial management and mindful emotional validation.",
  };

  // 8. NADI KUTA (8 pts)
  const nadi1 = NAKSHATRA_NADI[nak1] || "Aadi";
  const nadi2 = NAKSHATRA_NADI[nak2] || "Madhya";
  let nadiPts = 0;
  if (nadi1 !== nadi2) {
    nadiPts = 8;
  } else {
    // Same Nadi: Check classical cancellation exceptions
    // Exception 1: Different Rashis despite same Nakshatra or same Rashi with different Nakshatras
    if (rashi1 !== rashi2 || nak1 !== nak2) {
      nadiPts = 8; // Nadi Dosha cancelled
    } else {
      nadiPts = 0;
    }
  }
  const nadi: KutaScore = {
    name: "Nadi",
    sanskrit: "नाड़ी कूट",
    pointsReceived: nadiPts,
    maxPoints: 8,
    status: nadiPts === 8 ? "Full" : "Dosha",
    description: nadiPts === 8
      ? `Physiological balance (${nadi1} & ${nadi2}) confers excellent health resonance, vitality, and genetic blessing.`
      : `Same Nadi (${nadi1}); classical Nadi Dosha indicates similar nervous systems. Emphasize mindful wellness, pranayama, and medical awareness.`,
  };

  // Total
  const totalScore = varnaPts + vashyaPts + taraPts + yoniPts + maitriPts + ganaPts + bhakootPts + nadiPts;
  const percentage = Math.round((totalScore / 36) * 100);

  let verdict: "Excellent" | "Good & Compatible" | "Challenging / Remedial Guidance Advised" = "Good & Compatible";
  let verdictSanskrit: "Uttama" | "Madhyama" | "Adhama" = "Madhyama";

  if (totalScore >= 28) {
    verdict = "Excellent";
    verdictSanskrit = "Uttama";
  } else if (totalScore >= 18) {
    verdict = "Good & Compatible";
    verdictSanskrit = "Madhyama";
  } else {
    verdict = "Challenging / Remedial Guidance Advised";
    verdictSanskrit = "Adhama";
  }

  // Manglik Check
  const p1Manglik = chart1.analysis.doshas.isManglik;
  const p2Manglik = chart2.analysis.doshas.isManglik;
  let manglikCompatible = true;
  let manglikSummary = "";

  if (p1Manglik && p2Manglik) {
    manglikSummary = "Both charts possess Kuja (Manglik) influence, mutually neutralizing and balancing the fiery energy (Kuja Dosha Samyam).";
  } else if (!p1Manglik && !p2Manglik) {
    manglikSummary = "Neither partner carries Manglik Dosha; marital energy is calm and harmonious.";
  } else {
    manglikCompatible = false;
    manglikSummary = "One partner has Manglik placement while the other does not. Channeling physical exercise, sports, and collaborative projects relieves excess Mars drive.";
  }

  // Synthesis
  const strengths: string[] = [];
  const cautions: string[] = [];
  const remedialAdvice: string[] = [];

  if (maitriPts >= 4) strengths.push("Strong intellectual companionship and conversational ease");
  if (bhakootPts === 7) strengths.push("Natural harmony in financial planning and home life");
  if (nadiPts === 8) strengths.push("Complementary energetic constitution supporting mutual vitality");
  if (yoniPts >= 3) strengths.push("Warm instinctual attraction and affectionate bond");

  if (nadiPts === 0) {
    cautions.push("Both share identical Nadi constitution; prioritize balanced stress management");
    remedialAdvice.push("Practice joint Maha Mrityunjaya mantra chanting or voluntary community service (Daan)");
  }
  if (bhakootPts === 0) {
    cautions.push("Potential differences in handling domestic budgets and emotional expectations");
    remedialAdvice.push("Maintain separate personal accounts alongside a shared family fund, with weekly check-ins");
  }
  if (ganaPts === 0) {
    cautions.push("Contrasting temperamental tempos when resolving sudden disagreements");
    remedialAdvice.push("Avoid immediate heated discussions; agree to take a 20-minute pause before addressing conflict");
  }
  if (!manglikCompatible) {
    remedialAdvice.push("Honoring Hanuman Chalisa or Tuesday morning grounding walks to pacify Martian fire");
  }

  return {
    totalScore,
    maxScore: 36,
    percentage,
    verdict,
    verdictSanskrit,
    kutas: {
      varna,
      vashya,
      tara,
      yoni,
      grahaMaitri,
      gana,
      bhakoot,
      nadi,
    },
    manglikAnalysis: {
      isCompatible: manglikCompatible,
      partner1Manglik: p1Manglik,
      partner2Manglik: p2Manglik,
      summary: manglikSummary,
    },
    synthesis: {
      strengths,
      cautions,
      remedialAdvice,
    },
  };
}
