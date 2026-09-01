export interface BirthDetails {
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  currentLocation?: string;
  gender: string;
  interests: string[];
}

/** Placeholder for a future astrology calculation engine. */
export interface AstrologyData {
  ascendant: string | null;
  moonSign: string | null;
  nakshatra: string | null;
  planetPositions: Array<{ planet: string; sign: string; house: number }>;
  houses: Array<{ house: number; sign: string }>;
  dasha: { mahadasha: string; antardasha: string } | null;
  panchang: Record<string, string> | null;
}

export const emptyAstrologyData: AstrologyData = {
  ascendant: null,
  moonSign: null,
  nakshatra: null,
  planetPositions: [],
  houses: [],
  dasha: null,
  panchang: null,
};

export interface TitledSection {
  title: string;
  content: string;
}

export interface PlanetaryInsight {
  planet: string;
  symbol: string;
  interpretation: string;
}

export interface HouseInsight {
  house: string;
  area: string;
  interpretation: string;
}

export interface GuidanceItem {
  title: string;
  description: string;
}

export interface AstrologyReading {
  summary: { headline: string; overview: string };
  personality: TitledSection;
  strengths: string[];
  challenges: string[];
  planetaryInsights: PlanetaryInsight[];
  houseInsights: HouseInsight[];
  career: TitledSection;
  finance: TitledSection;
  relationships: TitledSection;
  education: TitledSection;
  spirituality: TitledSection;
  currentFocus: TitledSection;
  guidance: GuidanceItem[];
  disclaimer: string;
}

export interface StoredReading {
  birth: BirthDetails;
  reading: AstrologyReading;
  astrologyData: AstrologyData;
  generatedAt: string;
}

export const DISCLAIMER =
  "This reading is generated using AI and draws from traditional astrological concepts for reflective and informational purposes. Astrology is not scientifically established as a method for predicting future events. This experience should not replace professional medical, financial, legal or mental health advice.";

export const INTEREST_OPTIONS = [
  "Personality",
  "Career",
  "Money",
  "Relationships",
  "Marriage",
  "Education",
  "Travel",
  "Spirituality",
  "Future Periods",
  "Complete Reading",
] as const;
