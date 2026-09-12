import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "Cosmic Seeker";
    const ascendant = searchParams.get("ascendant") || "Aries";
    const moonSign = searchParams.get("moon") || "Taurus";
    const nakshatra = searchParams.get("nakshatra") || "Rohini";
    const dasha = searchParams.get("dasha") || "Jupiter";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#0d0a14",
            backgroundImage: "radial-gradient(circle at 50% 20%, #2e1c4a 0%, #0d0a14 75%)",
            padding: "60px 80px",
            fontFamily: "system-ui, sans-serif",
            color: "#f5f3ef",
            border: "12px solid #231d33",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(224, 179, 90, 0.2)",
                  border: "1px solid #e0b35a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                  color: "#e0b35a",
                }}
              >
                ✦
              </div>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  color: "#f5f3ef",
                }}
              >
                CosmicLens <span style={{ color: "#e0b35a" }}>AI</span>
              </span>
            </div>
            <div
              style={{
                fontSize: "16px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#e0b35a",
                border: "1px solid rgba(224, 179, 90, 0.4)",
                padding: "6px 16px",
                borderRadius: "999px",
              }}
            >
              Vedic Janma Kundli
            </div>
          </div>

          {/* Center Chart Profile */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              margin: "20px 0",
            }}
          >
            <div
              style={{
                fontSize: "20px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#a49bb5",
                marginBottom: "8px",
              }}
            >
              Vedic Astrological Blueprint
            </div>
            <div
              style={{
                fontSize: "56px",
                fontWeight: 800,
                color: "#ffffff",
                letterSpacing: "-0.5px",
                textShadow: "0 0 30px rgba(224, 179, 90, 0.3)",
              }}
            >
              {name}
            </div>
          </div>

          {/* Key Vedic Pillars Grid */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              width: "100%",
            }}
          >
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(25, 20, 36, 0.75)",
                border: "1px solid rgba(224, 179, 90, 0.25)",
                borderRadius: "16px",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: "13px", color: "#a49bb5", textTransform: "uppercase", letterSpacing: "1px" }}>
                Ascendant (Lagna)
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#e0b35a", marginTop: "4px" }}>
                {ascendant}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(25, 20, 36, 0.75)",
                border: "1px solid rgba(224, 179, 90, 0.25)",
                borderRadius: "16px",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: "13px", color: "#a49bb5", textTransform: "uppercase", letterSpacing: "1px" }}>
                Moon Sign (Rashi)
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#e0b35a", marginTop: "4px" }}>
                {moonSign}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(25, 20, 36, 0.75)",
                border: "1px solid rgba(224, 179, 90, 0.25)",
                borderRadius: "16px",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: "13px", color: "#a49bb5", textTransform: "uppercase", letterSpacing: "1px" }}>
                Nakshatra
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#e0b35a", marginTop: "4px" }}>
                {nakshatra}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(25, 20, 36, 0.75)",
                border: "1px solid rgba(224, 179, 90, 0.25)",
                borderRadius: "16px",
                padding: "16px 20px",
              }}
            >
              <div style={{ fontSize: "13px", color: "#a49bb5", textTransform: "uppercase", letterSpacing: "1px" }}>
                Current Dasha
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "#e0b35a", marginTop: "4px" }}>
                {dasha}
              </div>
            </div>
          </div>

          {/* Footer watermark */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "20px",
              fontSize: "14px",
              color: "#8a819c",
            }}
          >
            <span>Precise Lahiri Ayanamsha Ephemeris</span>
            <span>https://cosmiclens.ai</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate OG image: ${e.message}`, { status: 500 });
  }
}
