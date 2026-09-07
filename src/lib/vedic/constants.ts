// Vedic Astrology Constants & Foundational Data

export interface ZodiacSignInfo {
  id: number; // 1 to 12
  name: string;
  sanskrit: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  ruler: string;
  startDeg: number;
  endDeg: number;
}

export const ZODIAC_SIGNS: readonly ZodiacSignInfo[] = [
  { id: 1, name: "Aries", sanskrit: "Mesha", symbol: "♈", element: "Fire", ruler: "Mars", startDeg: 0, endDeg: 30 },
  { id: 2, name: "Taurus", sanskrit: "Vrishabha", symbol: "♉", element: "Earth", ruler: "Venus", startDeg: 30, endDeg: 60 },
  { id: 3, name: "Gemini", sanskrit: "Mithuna", symbol: "♊", element: "Air", ruler: "Mercury", startDeg: 60, endDeg: 90 },
  { id: 4, name: "Cancer", sanskrit: "Karka", symbol: "♋", element: "Water", ruler: "Moon", startDeg: 90, endDeg: 120 },
  { id: 5, name: "Leo", sanskrit: "Simha", symbol: "♌", element: "Fire", ruler: "Sun", startDeg: 120, endDeg: 150 },
  { id: 6, name: "Virgo", sanskrit: "Kanya", symbol: "♍", element: "Earth", ruler: "Mercury", startDeg: 150, endDeg: 180 },
  { id: 7, name: "Libra", sanskrit: "Tula", symbol: "♎", element: "Air", ruler: "Venus", startDeg: 180, endDeg: 210 },
  { id: 8, name: "Scorpio", sanskrit: "Vrischika", symbol: "♏", element: "Water", ruler: "Mars", startDeg: 210, endDeg: 240 },
  { id: 9, name: "Sagittarius", sanskrit: "Dhanu", symbol: "♐", element: "Fire", ruler: "Jupiter", startDeg: 240, endDeg: 270 },
  { id: 10, name: "Capricorn", sanskrit: "Makara", symbol: "♑", element: "Earth", ruler: "Saturn", startDeg: 270, endDeg: 300 },
  { id: 11, name: "Aquarius", sanskrit: "Kumbha", symbol: "♒", element: "Air", ruler: "Saturn", startDeg: 300, endDeg: 330 },
  { id: 12, name: "Pisces", sanskrit: "Meena", symbol: "♓", element: "Water", ruler: "Jupiter", startDeg: 330, endDeg: 360 },
] as const;

export interface NakshatraInfo {
  id: number; // 1 to 27
  name: string;
  sanskrit: string;
  ruler: string;
  deity: string;
  symbol: string;
  startDeg: number;
  endDeg: number;
}

export const NAKSHATRAS: readonly NakshatraInfo[] = [
  { id: 1, name: "Ashwini", sanskrit: "अश्विनी", ruler: "Ketu", deity: "Ashwini Kumaras", symbol: "Horse head", startDeg: 0, endDeg: 13.333333 },
  { id: 2, name: "Bharani", sanskrit: "भरणी", ruler: "Venus", deity: "Yama", symbol: "Yoni", startDeg: 13.333333, endDeg: 26.666667 },
  { id: 3, name: "Krittika", sanskrit: "कृत्तिका", ruler: "Sun", deity: "Agni", symbol: "Razor / Flame", startDeg: 26.666667, endDeg: 40.0 },
  { id: 4, name: "Rohini", sanskrit: "रोहिणी", ruler: "Moon", deity: "Brahma", symbol: "Cart / Chariot", startDeg: 40.0, endDeg: 53.333333 },
  { id: 5, name: "Mrigashira", sanskrit: "मृगशिरा", ruler: "Mars", deity: "Soma", symbol: "Deer head", startDeg: 53.333333, endDeg: 66.666667 },
  { id: 6, name: "Ardra", sanskrit: "आर्द्रा", ruler: "Rahu", deity: "Rudra", symbol: "Teardrop / Diamond", startDeg: 66.666667, endDeg: 80.0 },
  { id: 7, name: "Punarvasu", sanskrit: "पुनर्वसु", ruler: "Jupiter", deity: "Aditi", symbol: "Bow and quiver", startDeg: 80.0, endDeg: 93.333333 },
  { id: 8, name: "Pushya", sanskrit: "पुष्य", ruler: "Saturn", deity: "Brihaspati", symbol: "Flower / Udder", startDeg: 93.333333, endDeg: 106.666667 },
  { id: 9, name: "Ashlesha", sanskrit: "आश्लेषा", ruler: "Mercury", deity: "Nagas", symbol: "Coiled serpent", startDeg: 106.666667, endDeg: 120.0 },
  { id: 10, name: "Magha", sanskrit: "मघा", ruler: "Ketu", deity: "Pitris", symbol: "Royal throne", startDeg: 120.0, endDeg: 133.333333 },
  { id: 11, name: "Purva Phalguni", sanskrit: "पूर्वा फाल्गुनी", ruler: "Venus", deity: "Bhaga", symbol: "Front legs of bed", startDeg: 133.333333, endDeg: 146.666667 },
  { id: 12, name: "Uttara Phalguni", sanskrit: "उत्तरा फाल्गुनी", ruler: "Sun", deity: "Aryaman", symbol: "Back legs of bed", startDeg: 146.666667, endDeg: 160.0 },
  { id: 13, name: "Hasta", sanskrit: "हस्त", ruler: "Moon", deity: "Savitr", symbol: "Hand / Palm", startDeg: 160.0, endDeg: 173.333333 },
  { id: 14, name: "Chitra", sanskrit: "चित्रा", ruler: "Mars", deity: "Vishvakarma", symbol: "Bright jewel", startDeg: 173.333333, endDeg: 186.666667 },
  { id: 15, name: "Swati", sanskrit: "स्वाती", ruler: "Rahu", deity: "Vayu", symbol: "Young plant shoot", startDeg: 186.666667, endDeg: 200.0 },
  { id: 16, name: "Vishakha", sanskrit: "विशाखा", ruler: "Jupiter", deity: "Indra-Agni", symbol: "Triumphal arch", startDeg: 200.0, endDeg: 213.333333 },
  { id: 17, name: "Anuradha", sanskrit: "अनुराधा", ruler: "Saturn", deity: "Mitra", symbol: "Lotus flower", startDeg: 213.333333, endDeg: 226.666667 },
  { id: 18, name: "Jyeshtha", sanskrit: "ज्येष्ठा", ruler: "Mercury", deity: "Indra", symbol: "Amulet / Umbrella", startDeg: 226.666667, endDeg: 240.0 },
  { id: 19, name: "Mula", sanskrit: "मूल", ruler: "Ketu", deity: "Nirriti", symbol: "Tied bunch of roots", startDeg: 240.0, endDeg: 253.333333 },
  { id: 20, name: "Purva Ashadha", sanskrit: "पूर्वाषाढ़ा", ruler: "Venus", deity: "Apas", symbol: "Winnowing basket", startDeg: 253.333333, endDeg: 266.666667 },
  { id: 21, name: "Uttara Ashadha", sanskrit: "उत्तराषाढ़ा", ruler: "Sun", deity: "Vishvadevas", symbol: "Elephant tusk", startDeg: 266.666667, endDeg: 280.0 },
  { id: 22, name: "Shravana", sanskrit: "श्रवण", ruler: "Moon", deity: "Vishnu", symbol: "Ear / Three footprints", startDeg: 280.0, endDeg: 293.333333 },
  { id: 23, name: "Dhanishta", sanskrit: "धनिष्ठा", ruler: "Mars", deity: "Ashta Vasus", symbol: "Flute / Drum", startDeg: 293.333333, endDeg: 306.666667 },
  { id: 24, name: "Shatabhisha", sanskrit: "शतभिषा", ruler: "Rahu", deity: "Varuna", symbol: "Empty circle / 100 healers", startDeg: 306.666667, endDeg: 320.0 },
  { id: 25, name: "Purva Bhadrapada", sanskrit: "पूर्वाभाद्रपदा", ruler: "Jupiter", deity: "Aja Ekapada", symbol: "Sword / Two faces", startDeg: 320.0, endDeg: 333.333333 },
  { id: 26, name: "Uttara Bhadrapada", sanskrit: "उत्तराभाद्रपदा", ruler: "Saturn", deity: "Ahirbudhnya", symbol: "Snake in water", startDeg: 333.333333, endDeg: 346.666667 },
  { id: 27, name: "Revati", sanskrit: "रेवती", ruler: "Mercury", deity: "Pushan", symbol: "Fish / Drum", startDeg: 346.666667, endDeg: 360.0 },
] as const;

export interface PlanetDignityInfo {
  name: string;
  sanskrit: string;
  glyph: string;
  shortCode: string;
  ownSigns: number[]; // sign IDs
  exaltationSign: number;
  exaltationDegree: number;
  debilitationSign: number;
  debilitationDegree: number;
  combustionOrb: number; // degrees from Sun
}

export const PLANET_DIGNITIES: Record<string, PlanetDignityInfo> = {
  Sun: { name: "Sun", sanskrit: "Surya", glyph: "☉", shortCode: "Su", ownSigns: [5], exaltationSign: 1, exaltationDegree: 10, debilitationSign: 7, debilitationDegree: 10, combustionOrb: 0 },
  Moon: { name: "Moon", sanskrit: "Chandra", glyph: "☽", shortCode: "Mo", ownSigns: [4], exaltationSign: 2, exaltationDegree: 3, debilitationSign: 8, debilitationDegree: 3, combustionOrb: 12 },
  Mars: { name: "Mars", sanskrit: "Mangala", glyph: "♂", shortCode: "Ma", ownSigns: [1, 8], exaltationSign: 10, exaltationDegree: 28, debilitationSign: 4, debilitationDegree: 28, combustionOrb: 17 },
  Mercury: { name: "Mercury", sanskrit: "Budha", glyph: "☿", shortCode: "Me", ownSigns: [3, 6], exaltationSign: 6, exaltationDegree: 15, debilitationSign: 12, debilitationDegree: 15, combustionOrb: 14 },
  Jupiter: { name: "Jupiter", sanskrit: "Guru", glyph: "♃", shortCode: "Ju", ownSigns: [9, 12], exaltationSign: 4, exaltationDegree: 5, debilitationSign: 10, debilitationDegree: 5, combustionOrb: 11 },
  Venus: { name: "Venus", sanskrit: "Shukra", glyph: "♀", shortCode: "Ve", ownSigns: [2, 7], exaltationSign: 12, exaltationDegree: 27, debilitationSign: 6, debilitationDegree: 27, combustionOrb: 10 },
  Saturn: { name: "Saturn", sanskrit: "Shani", glyph: "♄", shortCode: "Sa", ownSigns: [10, 11], exaltationSign: 7, exaltationDegree: 20, debilitationSign: 1, debilitationDegree: 20, combustionOrb: 15 },
  Rahu: { name: "Rahu", sanskrit: "Rahu", glyph: "☊", shortCode: "Ra", ownSigns: [11], exaltationSign: 2, exaltationDegree: 20, debilitationSign: 8, debilitationDegree: 20, combustionOrb: 0 },
  Ketu: { name: "Ketu", sanskrit: "Ketu", glyph: "☋", shortCode: "Ke", ownSigns: [8], exaltationSign: 8, exaltationDegree: 20, debilitationSign: 2, debilitationDegree: 20, combustionOrb: 0 },
};

export interface DashaOrder {
  planet: string;
  durationYears: number;
}

export const VIMSHOTTARI_CYCLE: readonly DashaOrder[] = [
  { planet: "Ketu", durationYears: 7 },
  { planet: "Venus", durationYears: 20 },
  { planet: "Sun", durationYears: 6 },
  { planet: "Moon", durationYears: 10 },
  { planet: "Mars", durationYears: 7 },
  { planet: "Rahu", durationYears: 18 },
  { planet: "Jupiter", durationYears: 16 },
  { planet: "Saturn", durationYears: 19 },
  { planet: "Mercury", durationYears: 17 },
] as const;

export const TOTAL_VIMSHOTTARI_YEARS = 120;
