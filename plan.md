# CosmicLens AI — Enterprise Production & Monetization Architecture Plan

This document outlines the end-to-end architectural blueprint and phased roadmap to scale **CosmicLens AI (Vedic Voyage)** from an MVP into a fault-tolerant, mathematically rigorous, agentic, and highly profitable Vedic astrology enterprise platform.

---

## 1. System Architecture & Core Engineering Pillars

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT / PRESENTATION LAYER                           │
│  TanStack Start / Next.js SSR + Static Edge (Zero-Hydration SSG for SEO Pages)  │
└───────────────────────┬─────────────────────────────────┬───────────────────────┘
                        │                                 │
           GraphQL / Server Functions               Stripe / Razorpay Webhooks
                        │                                 │
┌───────────────────────▼─────────────────────────────────▼───────────────────────┐
│                          APPLICATION & ORCHESTRATION LAYER                      │
│                  Node.js / Nitro Serverless Backend (Auth, Gateway, UI BFF)     │
└───────────┬─────────────────────────────┬─────────────────────────────┬─────────┘
            │ (Deterministic Cache)       │ (RPC / REST)                │
            ▼                             ▼                             ▼
┌───────────────────────┐   ┌───────────────────────────┐   ┌─────────────────────┐
│  Upstash Redis Cache  │   │   Vedic Calculation Engine│   │ Multi-Agent AI Core │
│  - Immutable Ephemeris│   │   (Python / FastAPI)      │   │ - Data Parser Agent │
│  - User Session State │   │   - pyswisseph (Lahiri)   │   │ - Jyotish RAG Agent │
│  - Rate Limiting      │   │   - Bhava & Dasha Graphs  │   │ - Narrative Agent   │
└───────────────────────┘   └───────────────────────────┘   └─────────────────────┘
```

### Pillar A: Decoupled Vedic Calculation Engine (Python / FastAPI)
* **Problem**: Running Swiss Ephemeris C-bindings or heavy AST calculations in Node.js blocks the event loop, introduces memory leak vulnerabilities, and limits mathematical precision.
* **Solution**: A dedicated Python/FastAPI microservice powered by `pyswisseph` (the astronomical gold standard).
* **Responsibilities**:
  * Accurate Julian Day calculation, true oblique planetary positions, and **Lahiri Ayanamsha (Chitra Paksha)**.
  * House Cusps (Sripati / Bhava Chalit and Equal House).
  * Planetary entity-relationship graphs: house lordships, aspects (Drishti), exaltations/debilitations, Shadbala, and combustion (Asta).
  * Vimshottari Dasha generation down to Pratyantardasha with exact transition timestamps.
  * Structural output: Clean, validated JSON node-link graph consumed by both the frontend visualizers and the AI orchestration layer.

### Pillar B: Agentic AI Orchestration & Scriptural RAG (Beyond Single-Prompt Wrappers)
* **Problem**: Single LLM prompts hallucinate astrological rules, blend conflicting schools, or miscalculate dasha-transit interactions.
* **Solution**: A three-stage multi-agent orchestration pipeline:
  1. **Ephemeris Data Parser Agent**: Ingests raw calculation JSON from FastAPI. Extracts salient combinations (e.g., Saturn transit over natal Moon = Sade Sati; 7th lord debilitated in 6th house; current Mahadasha/Antardasha lord dynamics). Translates math into structured astrological facts.
  2. **Scriptural RAG Specialist Agent**: Queries a curated vector store (Brihat Parashara Hora Shastra, Phaladeepika, Jaimini Sutras) to retrieve canonical, verified interpretations for the specific identified yogas and dasha combinations.
  3. **Empathetic Narrative Synthesis Agent**: Merges astrological facts and scriptural context into a warm, modern, empowering narrative tailored to the user's focus areas, ensuring deterministic rules are respected and no fear-based predictions are made.

### Pillar C: Permanent Deterministic Ephemeris Caching
* **Insight**: A person's birth time, latitude, and longitude are immutable. Their natal chart never changes.
* **Mechanism**:
  * Generate a deterministic cache key: `hash = SHA256(UTC_ISO_Timestamp + Latitude + Longitude + Ayanamsha)`.
  * Store the complete raw calculation in Upstash Redis / Cloudflare KV with an indefinite TTL.
  * Re-computations are performed strictly **once per unique birth moment across the entire platform lifetime**.
  * Dynamic transit queries and daily horoscopes are computed on-the-fly by layering real-time celestial coordinates over the static, cached natal chart.

### Pillar D: Zero-Hydration Programmatic SEO Engine
* **Strategy**: Organic search is the primary high-intent user acquisition channel for astrology.
* **Implementation**:
  * Build pre-rendered static pages for thousands of long-tail keywords (e.g., `/nakshatra/ashwini-in-aries`, `/kundli-matching/manglik-dosha-remedies`, `/dashas/rahu-mahadasha-saturn-antardasha`).
  * Serve these as **pure zero-JS static HTML** with no hydration overhead, achieving 99+ Core Web Vitals on mobile.
  * Interactive components (e.g., "Enter Your Birth Info to Compare") load as progressive, isolated client islands on interaction.

---

## 2. Monetization Strategy & Revenue Architecture

### Pricing & Packaging
| Product Tier | Price Point | Deliverables & Feature Gate |
| :--- | :--- | :--- |
| **Free Explorer (Hook)** | $0 / ₹0 | Exact Ascendant, Moon Sign, Nakshatra, interactive North/South Kundli charts, 300-word high-level overview. |
| **Comprehensive Life Dossier** | $6.99 / ₹399 | 25+ page professional PDF report covering career, finances, marriage timing, Sade Sati analysis, and customized remedies. |
| **Kundli Milan (Synastry)** | $4.99 / ₹299 | 36-point Ashtakoota matching, Manglik dosha analysis, emotional and sexual compatibility deep-dive. |
| **Cosmic Pass (Subscription)** | $9.99/mo or $79/yr<br>(₹499/mo or ₹3,999/yr) | Unlimited multi-agent follow-up queries, daily personalized transit notifications (WhatsApp/Email), up to 5 saved family vaults. |
| **Consultation Credit Bundles** | $2.99 / ₹149 (5 credits) | Pay-as-you-go credits for targeted questions to the AI Astrologer. |

### Dual Payment Gateway Architecture
* **Global Users**: **Stripe** (Credit/Debit cards, Apple Pay, Google Pay).
* **Indian & Emerging Markets**: **Razorpay / Lemon Squeezy** (UPI, Netbanking, Rupay) to capture India's massive domestic astrology demographic without checkout friction.

---

## 3. Phased Execution Roadmap

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Engine Foundation & Mathematical Precision                     │
│ - Python/FastAPI microservice with pyswisseph                           │
│ - Geocoding, timezone resolution, and deterministic Redis cache         │
│ - Interactive North/South Indian Kundli chart components                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 2: Agentic Intelligence & High-Value Deliverables                 │
│ - Multi-agent orchestration (Fact Extractor ➔ Scriptural RAG ➔ Narrative)│
│ - Server-Sent Events (SSE) streaming output                             │
│ - Server-side high-resolution PDF Dossier generator                     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 3: Identity, Multi-Profile Vault & Retention                      │
│ - Passwordless authentication (Supabase / Clerk)                        │
│ - Multi-chart Cosmic Vault (Self, Partner, Family)                      │
│ - Dynamic Open Graph social sharing cards                               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 4: Monetization Engine & Paywall Workflows                        │
│ - Dual payment processing (Stripe + Razorpay / UPI)                     │
│ - Freemium gating & conversion-optimized unlock hooks                   │
│ - Subscription management, webhooks, and billing portals                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 5: Quality Assurance, Reliability & Data Integrity                │
│ - Ground-truth Ephemeris validation suite                               │
│ - Zod / Pydantic contract testing across all services                   │
│ - Playwright E2E testing for checkout & auth upgrade paths              │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 6: Programmatic SEO, Production Hardening & Global Launch         │
│ - Zero-hydration SSG landing pages for Nakshatras, signs & transits     │
│ - Upstash Redis rate limiting & prompt injection shields                │
│ - Legal compliance (GDPR, DPDP, disclaimer) & PostHog funnel analytics  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Engine Foundation & Mathematical Precision
* **Python/FastAPI Service Setup**:
  * Build standalone calculation service exposing `/api/v1/chart/calculate` and `/api/v1/chart/transits`.
  * Calculate Lahiri planetary degrees, Bhavas (Sripati / Equal), Nakshatra padas, and Vimshottari Dashas down to Pratyantardasha.
* **Geocoding & Timezone Service**:
  * Integration with GeoNames / OpenStreetMap Nominatim for city autocomplete.
  * Accurate historical DST and timezone resolution based on coordinates and birth year.
* **Deterministic Caching**:
  * Upstash Redis layer caching astronomical outputs indefinitely using SHA256 hashes of input coordinates and UTC timestamp.
* **Kundli Visualizers**:
  * Render SVG-based, responsive **North Indian (Diamond)** and **South Indian (Square)** charts with planetary glyphs, retrograde indicators, and hover state tooltips.

### Phase 2: Agentic Intelligence & High-Value Deliverables
* **Multi-Agent Orchestration**:
  * Deploy a 3-agent pipeline:
    1. *Data Parser Agent*: Parses FastAPI calculation graph into structured astrological facts.
    2. *Scriptural RAG Agent*: Vector search over foundational texts for authentic interpretations.
    3. *Narrative Synthesis Agent*: Generates empathetic, structured prose.
* **Streaming AI Responses (SSE)**:
  * Stream reading sections incrementally via Server-Sent Events for sub-second perceived latency.
* **Automated PDF Dossier Engine**:
  * Server-side PDF generation (`@react-pdf/renderer` or headless Chromium) generating a branded, 20+ page print-ready dossier with cover page, high-res Kundli chart, and personalized chapters.

### Phase 3: Identity, Multi-Profile Vault & Retention
* **Authentication**:
  * Passwordless Google OAuth and Email Magic Link / OTP via Supabase Auth or Clerk.
  * In-place guest-to-member account conversion without losing generated readings.
* **Cosmic Vault**:
  * Database schema for storing multiple profiles (self, partner, children, parents) with quick-switching.
* **Social Sharing Engine**:
  * Dynamic Open Graph (OG) image generation producing personalized "Cosmic Signature" cards (Ascendant + Moon + Sun archetype) optimized for Instagram, WhatsApp, and X.

### Phase 4: Monetization Engine & Paywall Workflows
* **Payment Gateways**:
  * Stripe integration for international cards, Apple Pay, and Google Pay.
  * Razorpay / Lemon Squeezy integration for Indian UPI, Netbanking, and RuPay cards.
* **Gating & Paywalls**:
  * Free tier reveals calculated astrological metrics + high-level summary.
  * High-value chapters (Dasha timing, career pivot years, marriage compatibility, Sade Sati remedies) blurred behind one-click checkout hooks.
* **Subscription Management**:
  * Webhook handling for subscription lifecycle events (payment failure, cancellation, renewals).
  * Automated delivery of weekly/monthly transit summaries for active subscribers.

### Phase 5: Quality Assurance, Reliability & Data Integrity
* **Ground-Truth Astronomical Validation Suite**:
  * Automated unit tests validating calculation engine outputs against 50+ benchmark, published charts (from BV Raman and Lahiri ephemeris tables) to ensure 0% drift in Ayanamsha and cusp calculations.
* **Strict Contract Testing**:
  * Zod schemas on the frontend and Pydantic models on the Python microservice to guarantee 100% schema compliance.
  * Fail-safe fallbacks if an LLM response fails validation.
* **Playwright E2E Test Suite**:
  * Automated browser testing covering critical revenue journeys:
    * Intake form submission ➔ Ephemeris calculation ➔ AI report generation.
    * Freemium reading ➔ Stripe/Razorpay checkout ➔ Webhook processing ➔ Unlocked PDF download.
    * Guest session ➔ Account registration ➔ Stored profile persistence.

### Phase 6: Programmatic SEO, Production Hardening & Global Launch
* **Programmatic SEO Funnel**:
  * Build SSG engine generating 10,000+ pre-rendered, zero-hydration static landing pages (Nakshatras, Zodiac combinations, Transit forecasts).
  * Optimized schema markup (`Article`, `FAQPage`, `BreadcrumbList`) for search rich snippets.
* **Security & Operational Hardening**:
  * Upstash Redis IP and account rate-limiting on server functions.
  * LLM prompt sanitization to prevent jailbreaking or prompt injection.
  * Failover logic between primary (Gemini 2.5 Pro) and fallback (Gemini Flash) models.
* **Compliance & Legal**:
  * Clear entertainment/reflective Vedic disclaimer displayed on all pages and exports.
  * Terms of Service, Privacy Policy, and GDPR/DPDP data deletion compliance.
* **Product Analytics**:
  * PostHog instrumentation tracking every step of the funnel (Conversion Rate from Visitor ➔ Free Report ➔ Paid Dossier ➔ Subscriber).

---

## 4. Production Tech Stack Matrix

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend & SSR** | TanStack Start (Current) / Next.js | Modern React 19 SSR framework with type-safe routing. |
| **SEO Static Pages** | Static HTML / Zero-Hydration Islands | Maximum Core Web Vitals score (99+) for high organic search rankings. |
| **Vedic Engine** | Python 3.12 + FastAPI + `pyswisseph` | Precision C-bindings for Swiss Ephemeris and Lahiri Ayanamsha. |
| **AI LLMs** | Google Gemini (2.5 / 3.0 Flash & Pro) | Low latency, 1M+ token context window, exceptional price-to-performance. |
| **RAG Vector Store** | Pinecone / pgvector (Supabase) | Fast semantic retrieval of classical Jyotish scripture excerpts. |
| **Caching & Rate Limits**| Upstash Redis | Serverless, low-latency key-value store for immutable chart caching. |
| **Database & Auth** | Supabase (PostgreSQL + Supabase Auth) | Reliable serverless relational DB with Row Level Security (RLS). |
| **Payments** | Stripe + Razorpay | Global coverage with frictionless UPI/cards in key astrology markets. |
| **Testing** | Pytest (Ephemeris) + Zod + Playwright | Complete coverage: math accuracy, contract schemas, and revenue E2E flows. |
| **PDF Generation** | `@react-pdf/renderer` / Puppeteer | High-resolution, multi-page vector PDF generation. |

---

## 5. Implementation Milestones

* **Milestone 1 (Sprint 1–2)**: Python FastAPI ephemeris microservice (`pyswisseph`) + Geocoding + North/South Kundli charts + Deterministic Redis caching.
* **Milestone 2 (Sprint 3–4)**: Multi-agent AI engine + Scriptural RAG + Server-Sent Events (SSE) streaming + Branded PDF generator.
* **Milestone 3 (Sprint 5–6)**: Supabase Auth + Cosmic Vault (multi-profile management) + Dynamic social share cards.
* **Milestone 4 (Sprint 7–8)**: Stripe & Razorpay dual checkout + Freemium paywalls + Subscription management.
* **Milestone 5 (Sprint 9)**: Ground-truth mathematical test suite + Zod contracts + Playwright E2E checkout testing.
* **Milestone 6 (Sprint 10)**: Programmatic SEO generation + Rate limiting + Legal compliance + Public launch.
