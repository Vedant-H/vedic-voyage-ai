import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { StoredReading } from "@/types/astrology";
import { cleanProse } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#0d0a14",
    color: "#f3effa",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.6,
  },
  coverPage: {
    padding: 48,
    backgroundColor: "#0d0a14",
    color: "#f3effa",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  goldText: {
    color: "#e5c07b",
  },
  primaryText: {
    color: "#b072e6",
  },
  mutedText: {
    color: "#9f97ad",
  },
  tagline: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#e5c07b",
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    color: "#c2b9d4",
    lineHeight: 1.5,
    marginBottom: 30,
  },
  metaBox: {
    border: "1pt solid #2a2238",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#161122",
    marginBottom: 20,
  },
  metaRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    color: "#9f97ad",
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    borderBottom: "1pt solid #2a2238",
    paddingBottom: 6,
    marginBottom: 14,
    marginTop: 18,
  },
  paragraph: {
    fontSize: 9.5,
    color: "#d8d1e6",
    marginBottom: 12,
    textAlign: "justify",
  },
  table: {
    width: "100%",
    border: "1pt solid #2a2238",
    borderRadius: 6,
    marginBottom: 16,
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#1c152c",
    padding: 6,
    borderBottom: "1pt solid #2a2238",
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#e5c07b",
    textTransform: "uppercase",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    padding: 6,
    borderBottom: "0.5pt solid #221b33",
  },
  tableCell: {
    fontSize: 8.5,
    color: "#e0d9f0",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#6b627d",
    borderTop: "0.5pt solid #1f1730",
    paddingTop: 6,
  },
  bulletItem: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 6,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5c07b",
    marginRight: 8,
    marginTop: 4,
  },
  card: {
    border: "1pt solid #2a2238",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#161122",
    marginBottom: 10,
  },
});

export function ReadingPdfDocument({ stored }: { stored: StoredReading }) {
  const { birth, reading, vedicChart, generatedAt } = stored;

  const place = [birth.birthCity, birth.birthState, birth.birthCountry].filter(Boolean).join(", ");
  const dateStr = new Date(generatedAt).toLocaleDateString(undefined, {
    dateStyle: "medium",
  });

  return (
    <Document title={`CosmicLens_Vedic_Reading_${birth.name || "Explorer"}`} author="CosmicLens AI">
      {/* PAGE 1: COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Text style={styles.tagline}>CosmicLens AI · Classical Jyotish Dossier</Text>
          <Text style={styles.mainTitle}>
            {birth.name ? `${birth.name}'s Cosmic Blueprint` : "Your Cosmic Blueprint"}
          </Text>
          <Text style={styles.subtitle}>
            A mathematically computed Vedic astrology dossier synthesized according to traditional
            Parashari principles (Lahiri Chitra Paksha Ayanamsha).
          </Text>

          <View style={styles.metaBox}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date of Birth</Text>
              <Text style={styles.metaValue}>{birth.dateOfBirth}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Time of Birth</Text>
              <Text style={styles.metaValue}>{birth.timeOfBirth}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Place of Birth</Text>
              <Text style={styles.metaValue}>{place || "N/A"}</Text>
            </View>
            {vedicChart && (
              <>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Lagna (Ascendant)</Text>
                  <Text style={styles.metaValue}>
                    {vedicChart.ascendant.signName} ({vedicChart.ascendant.formattedPosition})
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Moon Sign (Rashi)</Text>
                  <Text style={styles.metaValue}>
                    {vedicChart.planets.Moon?.signName} · {vedicChart.planets.Moon?.nakshatra.name} (Pada {vedicChart.planets.Moon?.pada})
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Ayanamsha</Text>
                  <Text style={styles.metaValue}>{vedicChart.ayanamsha.formatted}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View>
          <Text style={[styles.paragraph, { fontSize: 8.5, color: "#9f97ad", textAlign: "center" }]}>
            Confidential & Personal · Generated on {dateStr}
          </Text>
        </View>
      </Page>

      {/* PAGE 2: PLANETARY POSITIONS TABLE & SUMMARY */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>1. Planetary Blueprint & Ephemeris</Text>
        <Text style={styles.paragraph}>
          Astronomical positions computed to arcsecond precision using the Lahiri Ayanamsha. The
          Ascendant (Lagna) anchors the whole-sign houses (Bhavas).
        </Text>

        {vedicChart && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Planet</Text>
              <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Sign</Text>
              <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Degree</Text>
              <Text style={[styles.tableHeaderCell, { width: "25%" }]}>Nakshatra (Pada)</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>House</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "20%", fontWeight: "bold" }]}>Ascendant</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>{vedicChart.ascendant.signName}</Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>{vedicChart.ascendant.formattedPosition}</Text>
              <Text style={[styles.tableCell, { width: "25%" }]}>{vedicChart.ascendant.nakshatra.name} ({vedicChart.ascendant.pada})</Text>
              <Text style={[styles.tableCell, { width: "15%" }]}>1st House</Text>
            </View>
            {Object.values(vedicChart.planets).map((p: any) => (
              <View key={p.name} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "20%", fontWeight: "bold" }]}>
                  {p.name} {p.isRetrograde ? "(R)" : ""}
                </Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{p.signName}</Text>
                <Text style={[styles.tableCell, { width: "20%" }]}>{p.formattedPosition}</Text>
                <Text style={[styles.tableCell, { width: "25%" }]}>{p.nakshatra.name} ({p.pada})</Text>
                <Text style={[styles.tableCell, { width: "15%" }]}>
                  House {vedicChart.planetHouseMap[p.name] || 1}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>2. Executive Cosmic Summary</Text>
        <Text style={[styles.paragraph, { fontSize: 11, fontWeight: "bold", color: "#e5c07b" }]}>
          {cleanProse(reading.summary.headline)}
        </Text>
        <Text style={styles.paragraph}>{cleanProse(reading.summary.overview)}</Text>

        <Text style={styles.footer}>CosmicLens AI · Page 2</Text>
      </Page>

      {/* PAGE 3: PERSONALITY, STRENGTHS & CHALLENGES */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>3. Personality & Inner Nature</Text>
        <Text style={styles.paragraph}>{cleanProse(reading.personality.content)}</Text>

        <Text style={styles.sectionTitle}>4. Core Strengths & Growth Areas</Text>
        <View style={{ display: "flex", flexDirection: "row", gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.metaLabel, { color: "#e5c07b", marginBottom: 8 }]}>Innate Strengths</Text>
            {reading.strengths.map((s, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={[styles.tableCell, { flex: 1 }]}>{cleanProse(s)}</Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.metaLabel, { color: "#b072e6", marginBottom: 8 }]}>Growth Areas</Text>
            {reading.challenges.map((c, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <View style={[styles.bulletDot, { backgroundColor: "#b072e6" }]} />
                <Text style={[styles.tableCell, { flex: 1 }]}>{cleanProse(c)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>CosmicLens AI · Page 3</Text>
      </Page>

      {/* PAGE 4: CAREER & WEALTH */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>5. Career, Vocation & Dharma (10th House)</Text>
        <Text style={styles.paragraph}>{cleanProse(reading.career.content)}</Text>

        <Text style={styles.sectionTitle}>6. Wealth, Prosperity & Assets (2nd & 11th Houses)</Text>
        <Text style={styles.paragraph}>{cleanProse(reading.finance.content)}</Text>

        <Text style={styles.footer}>CosmicLens AI · Page 4</Text>
      </Page>

      {/* PAGE 5: RELATIONSHIPS & SPIRITUALITY */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>7. Relationships, Love & Union (7th House)</Text>
        <Text style={styles.paragraph}>{cleanProse(reading.relationships.content)}</Text>

        <Text style={styles.sectionTitle}>8. Higher Wisdom, Dharma & Spirituality (9th & 12th)</Text>
        <Text style={styles.paragraph}>{cleanProse(reading.spirituality.content)}</Text>

        <Text style={styles.footer}>CosmicLens AI · Page 5</Text>
      </Page>

      {/* PAGE 6: VIMSHOTTARI DASHA & SATTVIC GUIDANCE */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>9. Current Life Themes & Planetary Periods</Text>
        <Text style={styles.paragraph}>{cleanProse(reading.currentFocus.content)}</Text>

        <Text style={styles.sectionTitle}>10. Practical Guidance & Sattvic Remedies</Text>
        {reading.guidance.map((g, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={[styles.tableCell, { fontWeight: "bold", color: "#e5c07b", marginBottom: 3 }]}>
              {cleanProse(g.title)}
            </Text>
            <Text style={[styles.tableCell, { color: "#c2b9d4" }]}>{cleanProse(g.description)}</Text>
          </View>
        ))}

        <Text style={[styles.paragraph, { fontSize: 8, color: "#827896", marginTop: 14, textAlign: "center" }]}>
          {reading.disclaimer}
        </Text>

        <Text style={styles.footer}>CosmicLens AI · Page 6 (Final)</Text>
      </Page>
    </Document>
  );
}
