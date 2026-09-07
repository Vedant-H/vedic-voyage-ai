# CosmicLens AI — Enterprise Production Architecture & Astrotalk-Beating Product Blueprint

This document outlines the end-to-end architectural roadmap to build **CosmicLens AI (Vedic Voyage)** into a high-margin, scalable enterprise platform. Deployed as a **100% Next.js application** on Vercel with zero external microservices to maintain.

---

## 1. Product Strategy: CosmicLens AI vs. Astrotalk

Astrotalk built a massive business by operating a human marketplace. However, its model suffers from heavy operational bloat, variable consultation quality, predatory upselling (costly pujas and gemstones), and high privacy friction.

CosmicLens AI wins by replacing human inconsistency with **mathematical ephemeris accuracy**, **high psychological safety (confidentiality)**, and an **empathetic, context-aware Conversational AI Astrologer**.

| Dimension | Astrotalk (Human Marketplace) | CosmicLens AI (Pure AI Engine) |
| :--- | :--- | :--- |
| **Core Value Proposition** | Emotional validation via 1-on-1 human connection. | Instant, private, high-fidelity synthesis of classical Vedic astrology. |
| **Consultation Access** | Astrologer queues, per-minute billing (₹15–₹150+/min), call anxiety. | Zero latency, 24/7 continuous availability, zero judgment. |
| **Margin & Unit Economics** | Compressed by 40–60% astrologer payouts & CAC. | Software margins (90%+); unit costs tied strictly to LLM inference. |
| **Data Fidelity** | Often cold-reading, guesswork, or generic scripts. | Deterministic astronomical math (`astronomy-engine`, Lahiri Ayanamsha). |
| **Privacy & Vulnerability** | Friction: Exposing personal crises to a stranger. | High psychological safety: confidential, private, encrypted. |
| **Remedies Model** | Commercialized: Selling ₹5,000–₹50,000 gemstones & pujas. | Canonical & Sattvic: Practical lifestyle habits, fasting, mantras & charity. |

---

## 2. System Architecture & Core Engineering Pillars

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    UNIFIED 100% NEXT.JS FULLSTACK ARCHITECTURE                  │
│                     Single Repository — 1-Click Vercel Deploy                   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────┐
│  Client Presentation │  │  Server-Side Compute & APIs │  │   Edge & Static     │
│  - App Router        │  │  - Next.js Route Handlers   │  │   - Zero-Hydration  │
│  - React 19 + Radix  │  │  - Native TS Vedic Engine   │  │     SSG SEO Pages   │
│  - North/South Chart │  │    (`astronomy-engine`)     │  │   - Dynamic OG      │
│  - Push-to-Talk Voice│  │  - Multi-Agent Orchestrator │  │     Card Generation │
└──────────────────────┘  └──────────────┬──────────────┘  └─────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         ┌─────────────────────┐                   ┌─────────────────────┐
         │ Upstash Redis Cache │                   │   Supabase Cloud    │
         │ - Immutable Ephem.  │                   │   - PostgreSQL DB   │
         │ - Rate Limiting     │                   │   - Supabase Auth   │
         │ - Session Vector RAG│                   │   - Cosmic Vault    │
         └─────────────────────┘                   └─────────────────────┘
```

### Pillar A: In-Process TypeScript Vedic Engine (`astronomy-engine`)
* Mathematical geocentric longitudes computed to arcsecond accuracy.
* **Lahiri Ayanamsha (Chitra Paksha)** offset calculation.
* Ascendant (Lagna) and House Cusps (Parashari Whole-Sign & Bhava Chalit).
* Exaltations, debilitations, combustions (Asta), and retrograde detection.
* Vimshottari Dasha calculations (Mahadasha, Antardasha, Pratyantardasha).
* Yogas (Gaja Kesari, Budhaditya, etc.) and Doshas (Manglik, Kalsarpa, Sade Sati).

### Pillar B: The Empathetic Conversational AI Astrologer (Life Struggle Companion)
Users seek astrology during acute life struggles (heartbreak, career stagnation, health anxiety, parental burdens). A robotic calculator fails here. CosmicLens deploys a **3-tier agentic consultation framework**:
1. **The Active Listener Agent**: Validates emotional pain first. Identifies the life theme (career, 4th house family, 7th house relationships) without judgment.
2. **Astrological RAG Specialist Agent**: Queries the user's specific natal chart, active Vimshottari dasha, and Gochara transits to find the temporal root of the friction.
3. **The Therapeutic Synthesizer Agent**: Merges technical astrology with compassionate mentorship. Reframes difficult transits (e.g. Saturn or Rahu) not as "punishments" but as necessary growth seasons.
4. **Crisis Circuit Breakers**: Automatic intercept layer scanning for self-harm or medical emergencies, instantly triggering professional crisis helplines.
5. **Persistent Session Memory**: Long-term context recalling past struggles across sessions (e.g., *"Last time we spoke, you carried immense pressure supporting your parents. With Jupiter shifting, how has that felt this week?"*).
6. **Push-to-Talk Voice Companion**: Direct integration with Gemini Multimodal Live API for natural bidirectional spoken dialogue with barge-in support.

### Pillar C: Living Timeline & Dynamic Transits (Gochara)
* **Live Transit Overlay**: Visualizing current planetary movements over the natal chart (e.g., Saturn transiting natal Moon = Sade Sati).
* **Interactive Dasha Scrubber**: Clickable nested Mahadasha ➔ Antardasha ➔ Pratyantardasha timeline to inspect any past or future period.
* **Key Event Chronology**: Upcoming planetary shifts and their impact on specific houses.

### Pillar D: Multi-Chart Synastry & Divisional Vargas
* **36-Point Ashta-Kuta Kundli Milan**: Relationship matching with Nadi Dosha, Bhakoot analysis, and AI commentary on emotional vs. financial compatibility.
* **Divisional Charts**: D9 (Navamsha for marriage and inner potential) and D10 (Dashamsha for career trajectory).

### Pillar E: Strict Privacy & Transient Guest Architecture
* **Guest Privacy**: If a user is not signed in, reports are purely transient (`sessionStorage` only). When the user closes the website/tab, the report is permanently discarded. Zero local device persistence without consent.
* **Encrypted Cloud Vault**: Charts and readings are saved only when authenticated via Supabase Auth, secured by PostgreSQL Row-Level Security (RLS).

---

## 3. Monetization Strategy & Product Packaging

| Product Tier | Price Point | Deliverables & Feature Gate |
| :--- | :--- | :--- |
| **Free Basic Snapshot** | $0 / ₹0 | Ascendant, Moon Sign, Nakshatra, Whole-Sign Kundli, Core Strengths, and 2 teaser chapters. Fully discarded upon closing tab. |
| **Master Life Dossier** | $19 / ₹1,499 | Complete 15-page dossier: 12-house deep dive, 120-year Vimshottari timeline, classical BPHS remedies, vector PDF download. |
| **Kundli Milan (Synastry)** | $9.99 / ₹799 | 36-point Guna Milan matching between any two profiles in the Cosmic Vault. |
| **Cosmic Pass (Subscription)** | $14.99/mo<br>(₹999/mo) | Unlimited AI Astrologer consultations, live daily transit briefings, full multi-profile vault, Google/Apple Calendar auspicious transit sync. |

* **Gateways**: Stripe (USD, EUR, Apple Pay) + Razorpay (INR, UPI, GPay, PhonePe, NetBanking).

---

## 4. Phased Execution Roadmap

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Engine Foundation & Mathematical Precision (COMPLETE)          │
│ - Pure TypeScript ephemeris engine (Lahiri Ayanamsha, houses, dashas)   │
│ - Interactive SVG North & South Indian Kundli charts                    │
│ - Geocoding, timezone resolution, Upstash Redis caching                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 2: Agentic Intelligence & High-Value Deliverables (COMPLETE)      │
│ - 3-stage agentic synthesis (Data Parser ➔ Scriptural RAG ➔ Narrative)   │
│ - Real-time SSE streaming API (`/api/reading/stream`)                   │
│ - Vector PDF dossier generator (`@react-pdf/renderer`)                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 3: Identity & Cloud Vault (COMPLETE)                              │
│ - Supabase Auth (`@supabase/ssr`) with Google & Magic Link               │
│ - Cloud Cosmic Vault (`/vault`) with multi-profile categorization       │
│ - Dynamic Open Graph card generation (`/api/og`)                        │
│ - Strict ephemeral guest privacy (zero local leakage on tab close)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 4: Monetization Engine & Paywall Workflows (COMPLETE)             │
│ - Dual payment routes (Stripe Checkout + Razorpay Order APIs)           │
│ - Webhook handlers & HMAC signature verification                        │
│ - Frosted-glass chapter gating & instant unlock modal                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 5: Automated QA & Ephemeris Verification (COMPLETE)               │
│ - Node test suite benchmarked against known historical charts           │
│ - Zod API contract validation and clean Next.js production compilation  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 6: Conversational AI Astrologer & Living Transits (NEXT)          │
│ - Empathetic chat companion with Dasha & Gochara transit injection      │
│ - Crisis circuit breakers (`escalate_crisis`)                           │
│ - Clickable 120-year interactive timeline scrubber                      │
│ - Push-to-Talk voice interface (Gemini Multimodal Live)                 │
│ - Ashta-Kuta 36-Point Kundli Milan matching                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Production Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15+ (App Router), React 19, Tailwind CSS v4 |
| **Astrology Math** | Pure TypeScript (`astronomy-engine`) with Lahiri Ayanamsha |
| **AI LLM** | Google Gemini (2.5 / 3.0 Flash & Gemini Multimodal Live API) |
| **Database & Auth** | Supabase PostgreSQL + Supabase Auth (`@supabase/ssr`) |
| **Payments** | Stripe (Global Cards) + Razorpay (Indian UPI & Cards) |
| **Caching** | Upstash Redis |
| **PDF** | `@react-pdf/renderer` (Dynamic client-side vector renderer) |
