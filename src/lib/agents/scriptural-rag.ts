import type { AstrologicalFactSheet } from "./data-parser";

export interface ScripturalContext {
  bphsHousePrinciples: string[];
  planetaryKarakas: string[];
  classicalYogasContext: string[];
  sattvicRemedies: Array<{ planet: string; practice: string; rationale: string }>;
}

const BHAVA_SIGNIFICATIONS: Record<number, string> = {
  1: "Tanu Bhava (Self & Vitality): Governs bodily constitution, innate temperament, personal vitality, charisma, and life path orientation.",
  2: "Dhana Bhava (Wealth & Speech): Governs accumulated assets, family lineage, speech style, financial security, and oral consumption.",
  3: "Sahaja Bhava (Courage & Siblings): Governs willpower, short journeys, communication, technical and manual skills, and younger siblings.",
  4: "Sukha Bhava (Heart & Foundation): Governs inner happiness, mother, ancestral home, emotional roots, vehicles, and peace of mind.",
  5: "Putra Bhava (Intellect & Karma): Governs purva punya (past merit), creative intelligence, children, speculative skill, and mantra siddhi.",
  6: "Ari Bhava (Service & Obstacles): Governs daily routine, problem-solving, overcoming competitors, service orientation, and immune strength.",
  7: "Yuvati Bhava (Partnership & Union): Governs spouse, long-term romantic contracts, business partnerships, public encounters, and trade.",
  8: "Randhra Bhava (Transformation & Mystery): Governs longevity, sudden breakthroughs, psychological depth, occult knowledge, and joint finances.",
  9: "Dharma Bhava (Fortune & Higher Wisdom): Governs father, spiritual teachers (Gurus), philosophical alignment, higher education, and cosmic grace.",
  10: "Karma Bhava (Vocation & Honor): Governs highest career achievements, societal influence, authority, leadership, and public legacy.",
  11: "Labha Bhava (Gains & Aspirations): Governs major financial returns, peer networks, influential allies, fulfillment of long-term desires.",
  12: "Vyaya Bhava (Liberation & Solitude): Governs spiritual release (Moksha), foreign residence, meditative seclusion, dream realms, and expenses.",
};

const SATTVIC_REMEDIES: Record<string, { practice: string; rationale: string }> = {
  Sun: {
    practice: "Surya Namaskar at sunrise, offering fresh water to morning light, honoring paternal figures, and cultivating self-discipline.",
    rationale: "Aligns individual consciousness with universal solar radiance (Atma Karaka), boosting vitality and inner authority.",
  },
  Moon: {
    practice: "Chanting 'Om Namah Shivaya', drinking water from silver vessels, evening breathwork, honoring maternal figures, and regular journaling.",
    rationale: "Calms emotional fluctuation (Manas Karaka) and strengthens subconscious equilibrium.",
  },
  Mars: {
    practice: "Rigorous physical exercise, studying the Hanuman Chalisa, mindful channelization of competitive impulses, and defending the vulnerable.",
    rationale: "Transmutes aggressive fire into noble bravery and sustained goal-directed determination.",
  },
  Mercury: {
    practice: "Reading sacred or philosophical literature, practicing conscious silence (Mauna), green leafy nourishment, and charitable gifts of books or stationery.",
    rationale: "Sharpening intellectual discernment (Buddhi) and harmonious speech.",
  },
  Jupiter: {
    practice: "Supporting educators, meditating on saffron or golden dawn light, chanting the Gayatri Mantra, and volunteering for spiritual wisdom centers.",
    rationale: "Invokes Guru's expansive grace, divine optimism, and ethical prosperity.",
  },
  Venus: {
    practice: "Appreciation of pure sacred art, cultivating gracious kindness in speech, respecting women and creators, and maintaining clean, beautiful living surroundings.",
    rationale: "Elevates sensual attraction into refined devotion, aesthetic contentment, and relational harmony.",
  },
  Saturn: {
    practice: "Feeding stray animals (crows or dogs) on Saturdays, voluntary service to the elderly or underprivileged, patience, and honoring life's natural pace.",
    rationale: "Pacifies karmic friction (Karma Karaka) through humility, perseverance, and detachment.",
  },
  Rahu: {
    practice: "Daily grounding meditation, avoiding intoxicants, staying near natural forests or flowing rivers, and chanting the Maha Mrityunjaya Mantra.",
    rationale: "Subdues illusions, obsessive material grasping, and psychic anxiety.",
  },
  Ketu: {
    practice: "Silent Vipassana / mindfulness meditation, charity without expectation, introspection, and studying non-dual philosophy (Vedanta).",
    rationale: "Fosters true spiritual detachment (Moksha Karaka) and sharp intuitive insight.",
  },
};

/**
 * Scriptural RAG Agent:
 * Retrieves classical interpretations and authentic remedies tailored to the chart's specific planetary placements.
 */
export function retrieveScripturalContext(facts: AstrologicalFactSheet): ScripturalContext {
  const bphsHousePrinciples: string[] = [];

  // Include significations for key houses (1, 10, 7, 2, 9) plus house where Lagna Lord resides
  const keyHouses = [1, 2, 7, 9, 10, facts.lagnaLordPlacement.house];
  const uniqueHouses = Array.from(new Set(keyHouses));

  for (const h of uniqueHouses) {
    if (BHAVA_SIGNIFICATIONS[h]) {
      bphsHousePrinciples.push(BHAVA_SIGNIFICATIONS[h]!);
    }
  }

  const planetaryKarakas = [
    `Lagna Lord ${facts.lagnaLord} placed in House ${facts.lagnaLordPlacement.house}: Classical Jyotish states this links the primary life vitality directly to the themes of House ${facts.lagnaLordPlacement.house}.`,
    `Moon in ${facts.moonSign} (${facts.moonNakshatra}): Primary indicator of mental outlook, emotional resilience, and instinctual reaction patterns.`,
  ];

  if (facts.activeDasha) {
    planetaryKarakas.push(
      `Current Vimshottari Mahadasha is ruled by ${facts.activeDasha.mahadasha}, with sub-period of ${facts.activeDasha.antardasha}. Classical texts emphasize that life events during this era will predominantly activate the houses ruled and aspected by these two planets.`,
    );
  }

  const classicalYogasContext = facts.yogasPresent.map(
    (y) => `Classical Yoga: ${y.name} (${y.category}) — ${y.description}`,
  );

  // Determine needed remedies: Focus on debilitated, retrograde, or current Dasha lord
  const planetsNeedingCare = new Set<string>();
  if (facts.activeDasha) planetsNeedingCare.add(facts.activeDasha.mahadasha);
  for (const p of facts.debilitatedPlanets) planetsNeedingCare.add(p);
  if (facts.doshas.isManglik) planetsNeedingCare.add("Mars");
  if (facts.doshas.sadeSatiActive) planetsNeedingCare.add("Saturn");

  // If set is small, add Moon and Sun for balanced constitution
  if (planetsNeedingCare.size < 3) {
    planetsNeedingCare.add("Moon");
    planetsNeedingCare.add("Jupiter");
  }

  const sattvicRemedies = Array.from(planetsNeedingCare)
    .filter((p) => SATTVIC_REMEDIES[p])
    .map((p) => ({
      planet: p,
      practice: SATTVIC_REMEDIES[p]!.practice,
      rationale: SATTVIC_REMEDIES[p]!.rationale,
    }));

  return {
    bphsHousePrinciples,
    planetaryKarakas,
    classicalYogasContext,
    sattvicRemedies,
  };
}
