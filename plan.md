# CosmicLens AI — Enterprise Production & Monetization Architecture Plan

This document outlines the end-to-end architectural blueprint and phased roadmap to build **CosmicLens AI (Vedic Voyage)** as a unified, production-grade, 100% Next.js application that can be deployed to **Vercel in 1-click** with zero separate microservices to maintain.

---

## 1. System Architecture & Core Engineering Pillars

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
│  - Tailwind CSS v4   │  │    (`astronomy-engine`)     │  │   - Dynamic OG      │
│  - North/South Chart │  │  - 3-Stage AI Agent Core    │  │     Card Generation │
└──────────────────────┘  └──────────────┬──────────────┘  └─────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         ┌─────────────────────┐                   ┌─────────────────────┐
         │ Upstash Redis Cache │                   │   Supabase Cloud    │
         │ - Immutable Ephem.  │                   │   - PostgreSQL DB   │
         │ - Rate Limiting     │                   │   - Supabase Auth   │
         └─────────────────────┘                   └─────────────────────┘
```

### Pillar A: In-Process TypeScript Vedic Engine (`astronomy-engine` / WASM)
* **Design Decision**: Rather than managing a separate Python microservice (which requires two hosting providers, CORS management, and multi-service failure points), we run high-precision astronomical calculations directly inside Next.js using [`astronomy-engine`](https://www.npmjs.com/package/astronomy-engine).
* **Mathematical Precision**:
  * True geocentric planetary longitudes computed to arcsecond accuracy.
  * Precise **Lahiri Ayanamsha (Chitra Paksha)** offset calculation.
  * Ascendant (Lagna) and House Cusps (Sripati / Bhava Chalit and Equal House).
  * Planetary strengths: Exaltations, debilitations, combustions (Asta), and retrograde motions.
  * Moon Nakshatra & Pada calculations.
  * Vimshottari Dasha calculations (Mahadasha, Antardasha, Pratyantardasha) with exact timeline transitions.
  * Runs natively inside Vercel Serverless and Edge Functions with sub-millisecond execution times.

### Pillar B: Agentic AI Orchestration & Scriptural RAG
* **Beyond Single-Prompt Wrappers**:
  1. **Ephemeris Data Parser Agent**: Ingests raw TypeScript calculation outputs, translating mathematical angles and house positions into structured astrological facts (e.g., Saturn transit over natal Moon = Sade Sati; 7th lord exalted in 10th house).
  2. **Scriptural RAG Specialist Agent**: Queries a curated vector store (Brihat Parashara Hora Shastra, Phaladeepika) or canonical knowledge graph to retrieve verified, authentic interpretations for identified yogas.
  3. **Empathetic Narrative Synthesis Agent**: Synthesizes facts and classical wisdom into an engaging, structured reading using Gemini 2.0/3.0 with streaming responses (SSE).

### Pillar C: Permanent Deterministic Ephemeris Caching
* **Mechanism**:
  * Birth moment coordinates are immutable: `SHA256(UTC_Timestamp + Latitude + Longitude + Ayanamsha)`.
  * Store the complete raw calculation in Upstash Redis with permanent TTL.
  * Ephemeris calculations run strictly **once per unique birth moment**.
  * Transits and daily horoscopes layer dynamically on top of the cached natal foundation.

### Pillar D: Zero-Hydration Programmatic SEO Engine
* **Strategy**: Pre-render 10,000+ programmatic landing pages (Zodiac sign + Nakshatra combinations, transit guides, compatibility tools) at build time.
* **Core Web Vitals**: Delivered as pure zero-JS static HTML for near-instant mobile load times and top Google search rankings.

---

## 2. Monetization Strategy & Revenue Architecture

### Pricing & Packaging
| Product Tier | Price Point | Deliverables & Feature Gate |
| :--- | :--- | :--- |
| **Free Explorer (Hook)** | $0 / ₹0 | Exact Ascendant, Moon Sign, Nakshatra, interactive North/South Kundli charts, 300-word overview. |
| **Comprehensive Life Dossier** | $6.99 / ₹399 | 25+ page professional PDF report covering career, finances, marriage timing, Sade Sati analysis, and remedies. |
| **Kundli Milan (Synastry)** | $4.99 / ₹299 | 36-point Ashtakoota matching, Manglik dosha analysis, emotional and relationship compatibility. |
| **Cosmic Pass (Subscription)** | $9.99/mo or $79/yr<br>(₹499/mo or ₹3,999/yr) | Unlimited AI follow-up questions, daily personalized transit notifications (WhatsApp/Email), up to 5 saved family vaults. |
| **Consultation Credit Bundles** | $2.99 / ₹149 (5 credits) | Pay-as-you-go credits for targeted questions to the AI Astrologer. |

### Dual Payment Gateway Architecture
* **Global Users**: **Stripe** (Credit/Debit cards, Apple Pay, Google Pay).
* **Indian & Emerging Markets**: **Razorpay / Lemon Squeezy** (UPI, Netbanking, RuPay) to eliminate checkout friction.

---

## 3. Phased Execution Roadmap

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Engine Foundation & Mathematical Precision (TypeScript)        │
│ - Native TS Vedic engine using astronomy-engine (Lahiri Ayanamsha)      │
│ - Geocoding, timezone resolution, and deterministic Upstash Redis cache │
│ - Interactive North & South Indian Kundli chart components (SVG)        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 2: Agentic Intelligence & High-Value Deliverables                 │
│ - Multi-agent orchestration (Fact Extractor ➔ Scriptural RAG ➔ Narrative)│
│ - Server-Sent Events (SSE) streaming output in Next.js Route Handlers   │
│ - High-resolution PDF Dossier generator (`@react-pdf/renderer`)         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 3: Identity, Multi-Profile Vault & Retention                      │
│ - Passwordless authentication (Supabase Auth via Next.js SSR)           │
│ - Multi-chart Cosmic Vault (Self, Partner, Family)                      │
│ - Dynamic Open Graph social sharing cards (`@vercel/og`)                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 4: Monetization Engine & Paywall Workflows                        │
│ - Dual payment processing (Stripe + Razorpay / UPI Webhooks)            │
│ - Freemium gating & conversion-optimized unlock hooks                   │
│ - Subscription management, webhooks, and billing portals                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│ Phase 5: Quality Assurance, Reliability & Data Integrity                │
│ - Ground-truth Ephemeris validation suite against published BV Raman    │
│ - Zod contract testing across all Next.js API route handlers            │
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

## 4. Production Tech Stack Matrix (100% Next.js)

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | Single deployment target on Vercel, native SSR/SSG/ISR, streaming support. |
| **Vedic Engine** | `astronomy-engine` (TypeScript) | Pure JavaScript/TypeScript astronomical accuracy, sub-millisecond execution, zero server dependencies. |
| **Styling & UI** | Tailwind CSS v4 + Radix UI | Modern, dark-mode cosmic aesthetic with high performance. |
| **AI LLMs** | Google Gemini (2.5 / 3.0 Flash & Pro) | Low latency, 1M+ token context window, exceptional cost efficiency. |
| **Caching & Rate Limits**| Upstash Redis | Serverless Redis for ratelimiting and permanent chart caching. |
| **Database & Auth** | Supabase (PostgreSQL + Supabase Auth) | Direct integration with `@supabase/ssr` for server-side auth and row-level security. |
| **Payments** | Stripe + Razorpay | Comprehensive coverage for both international cards and Indian UPI. |
| **Testing** | Vitest + Zod + Playwright | Complete coverage: math accuracy, contract schemas, and revenue E2E flows. |
| **PDF Generation** | `@react-pdf/renderer` | Client/server vector PDF generation with zero external Chromium binary needed. |

---

## 5. Implementation Milestones

* **Milestone 1 (Sprint 1–2)**: Next.js migration + native TypeScript calculation engine (`astronomy-engine` with Lahiri Ayanamsha) + North/South Kundli charts + Upstash Redis cache.
* **Milestone 2 (Sprint 3–4)**: Multi-agent AI engine + Scriptural RAG + SSE streaming + Branded PDF generator.
* **Milestone 3 (Sprint 5–6)**: Supabase Auth (`@supabase/ssr`) + Cosmic Vault + Dynamic `@vercel/og` share cards.
* **Milestone 4 (Sprint 7–8)**: Stripe & Razorpay dual checkout + Freemium paywalls + Subscription management.
* **Milestone 5 (Sprint 9)**: Ground-truth mathematical test suite + Zod contracts + Playwright E2E checkout testing.
* **Milestone 6 (Sprint 10)**: Programmatic SEO generation + Rate limiting + Legal compliance + Public launch on Vercel.
