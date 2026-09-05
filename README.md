# Cosmic Insights AI

Build a complete, production-quality AI-powered Vedic Astrology website called CosmicLens AI.

The website should allow users to enter their birth information and receive a highly detailed AI-generated Vedic astrology reading.

CORE CONCEPT

The user enters:

Full Name (optional)

Date of Birth

Exact Time of Birth

Birth City

Birth State

Birth Country

Current City/Country (optional)

Gender (optional)

The system should collect this information and generate a detailed astrology profile.

The AI should behave like an experienced Vedic astrology analyst who understands:

Vedic Astrology / Jyotish

Kundli / Janam Kundli

Lagna / Ascendant

12 Houses

9 Grahas / Navagraha

Rahu and Ketu

Nakshatras

Panchang

Vimshottari Dasha

Mahadasha

Antardasha

Planetary transits

Yogas

Doshas

Career analysis

Financial analysis

Relationships

Marriage

Personality

Education

Spirituality

Traditional remedies

IMPORTANT: The website should clearly present astrology as a traditional/spiritual and entertainment-oriented interpretation and should not make guaranteed claims about the future.

TECH STACK

Build the website using:

Next.js

TypeScript

Tailwind CSS

shadcn/ui components

Lucide icons

Framer Motion for subtle animations

Use a lightweight architecture.

Do NOT build a complex traditional backend with user authentication, databases, admin dashboards, payment systems, or persistent user accounts.

The website should work without requiring users to sign up.

Use browser state for temporary form and reading data.

For Gemini AI integration, use a secure Next.js API route or serverless route handler.

Example architecture:

User fills form
→ Frontend validates input
→ Frontend sends structured JSON to /api/reading
→ Server-side route securely calls Google Gemini
→ Gemini generates structured astrology reading
→ API returns result
→ Frontend renders the reading beautifully

IMPORTANT SECURITY REQUIREMENT:

Never expose the Gemini API key in client-side JavaScript.

Use an environment variable:

GEMINI_API_KEY

The API route must read the key from environment variables.

WEBSITE DESIGN

The visual design should be:

Premium

Mystical

Modern

Clean

Dark

Futuristic

Not tacky

Not like a cheap astrology website

Minimal use of traditional clipart

No excessive orange/gold gradients

Sophisticated cosmic atmosphere

Design inspiration:

Apple-like minimalism combined with:

Deep space

Subtle stars

Constellations

Planetary orbit lines

Glassmorphism

Elegant gradients

Premium typography

Color direction:

Deep black

Midnight blue

Dark purple

Subtle indigo

Small gold accents

Soft white text

The UI should feel like a premium AI product rather than a traditional horoscope website.

Use smooth animations but keep performance high.

LANDING PAGE

Create a premium landing page.

HERO SECTION

Headline:

"Understand Your Cosmic Blueprint."

Subheadline:

"Enter your birth details and receive an AI-powered exploration of your Vedic birth chart, planetary influences and life patterns."

Primary CTA:

"Discover My Birth Chart"

Secondary text:

"No signup required"

Hero visual:

An elegant animated cosmic chart.

The chart should include:

Circular orbital elements

Constellation lines

Subtle glowing planets

Moving particles

Do not make the design cluttered.

FEATURES SECTION

Create four premium cards:

Your Birth Chart

Explore the planetary positions associated with your moment of birth.

Planetary Influences

Understand traditional interpretations of planets such as Rahu, Ketu, Saturn and Jupiter.

Life Insights

Explore career, relationships, finances and personal patterns.

AI Astrology Guide

Receive a personalized explanation in clear, understandable language.

HOW IT WORKS

Create a simple 3-step section.

01

Enter your birth details.

02

Our system analyzes the astrological information.

03

Receive your personalized AI-powered reading.

BIRTH DETAILS FORM

When the user clicks "Discover My Birth Chart", show a beautiful multi-step form.

STEP 1 — PERSONAL DETAILS

Fields:

Name

Date of Birth

Gender (optional)

STEP 2 — BIRTH DETAILS

Fields:

Time of Birth

Birth City

Birth State

Birth Country

Add helpful text:

"The accuracy of traditional birth-chart calculations can depend on the accuracy of your recorded birth time."

STEP 3 — QUESTIONS

Ask the user what they are most interested in.

Allow multiple selections:

Personality

Career

Money

Relationships

Marriage

Education

Travel

Spirituality

Future Periods

Complete Reading

LOADING EXPERIENCE

After the user submits the form, show a premium loading screen.

Do NOT immediately show a generic spinner.

Create multiple animated loading stages.

Example:

✓ Reading birth information

↓

✓ Mapping planetary influences

↓

✓ Examining houses and life areas

↓

✓ Exploring Nakshatra patterns

↓

✓ Analyzing current planetary periods

↓

✓ Generating your personalized reading

Each stage should animate gradually.

Show a subtle cosmic visualization in the background.

The experience should take at least a few seconds visually so it feels like a premium analysis experience, but do not artificially block the response if the API returns quickly.

GEMINI AI INTEGRATION

Create a secure API route:

/api/reading

The frontend should send:

{
"name": "",
"dateOfBirth": "",
"timeOfBirth": "",
"birthCity": "",
"birthState": "",
"birthCountry": "",
"gender": "",
"interests": []
}

The API route should securely call Google Gemini.

Use the latest stable Gemini model available in the configured Google AI SDK.

Keep the model name configurable through an environment variable if possible:

GEMINI_MODEL

The API should have:

Input validation

Error handling

Loading states

Timeout handling

Friendly fallback error messages

AI SYSTEM PROMPT

Use the following instruction for Gemini:

"You are an AI assistant that explains concepts and interpretations from traditional Vedic astrology (Jyotish).

Your role is to generate a thoughtful, detailed, structured astrology-style reading based on the user's provided birth information.

Important rules:

Present astrology as a traditional interpretive system, not as scientifically proven fact.

Do not claim certainty about future events.

Avoid statements such as:

You will definitely become rich.

You will definitely get married at age 27.

You will experience a disaster.

This event will certainly happen.

Instead use language such as:

Traditional astrology may interpret this as...

This placement is often associated with...

This period may bring increased focus toward...

Some practitioners might interpret this pattern as...

Never create fear-based predictions.

Never tell users they must spend money on rituals, gemstones, pujas or astrologers.

If suggesting traditional remedies, keep them optional, inexpensive and non-commercial.

Examples:

Meditation

Reflection

Charity

Prayer

Journaling

Mindfulness

Learning

Volunteering

Explain astrological concepts clearly for beginners.

Avoid generic statements as much as possible.

Structure the reading so it feels personalized, thoughtful and engaging.

Clearly distinguish between:

Calculated birth information

Traditional astrological interpretation

General reflective guidance

USER DATA:

Name: {{name}}

Date of Birth: {{dateOfBirth}}

Time of Birth: {{timeOfBirth}}

Birth City: {{birthCity}}

Birth State: {{birthState}}

Birth Country: {{birthCountry}}

Gender: {{gender}}

Areas the user wants explored:

{{interests}}

Generate the response in valid JSON only.

Use this exact JSON structure:

{
"summary": {
"headline": "",
"overview": ""
},

"personality": {
"title": "Personality & Inner Nature",
"content": ""
},

"strengths": [
"",
"",
""
],

"challenges": [
"",
"",
""
],

"planetaryInsights": [
{
"planet": "",
"symbol": "",
"interpretation": ""
}
],

"houseInsights": [
{
"house": "",
"area": "",
"interpretation": ""
}
],

"career": {
"title": "Career & Ambition",
"content": ""
},

"finance": {
"title": "Money & Opportunities",
"content": ""
},

"relationships": {
"title": "Relationships & Connections",
"content": ""
},

"education": {
"title": "Learning & Growth",
"content": ""
},

"spirituality": {
"title": "Spiritual Development",
"content": ""
},

"currentFocus": {
"title": "Current Life Themes",
"content": ""
},

"guidance": [
{
"title": "",
"description": ""
}
],

"disclaimer": ""
}

The reading should be detailed, engaging and personalized.

However, do not invent precise astronomical calculations if the system has not actually calculated them.

If exact planetary positions, Lagna, Nakshatra, Dasha or Panchang calculations are unavailable, explicitly describe interpretations as general birth-information-based traditional reflections rather than claiming precise planetary placements."

IMPORTANT ASTROLOGY DATA LOGIC

The system must NOT falsely claim:

"Your Rahu is in the 7th house"

unless actual astronomical/astrological calculations have been performed.

If the application does not have an astrology calculation engine, the AI must not fabricate:

Exact planet positions

Exact houses

Exact Lagna

Exact Nakshatra

Exact Mahadasha

Exact Antardasha

Exact Doshas

Instead, build the UI so it can support astrology calculation data later.

Create a separate object:

astrologyData

Example:

{
"ascendant": null,
"moonSign": null,
"nakshatra": null,
"planetPositions": [],
"houses": [],
"dasha": null,
"panchang": null
}

For the initial version, the Gemini AI should clearly know when this data is unavailable.

RESULTS PAGE

The result should feel premium and highly interactive.

At the top display:

"Your Cosmic Profile"

Below it:

A short personalized summary.

Example layout:

[ Cosmic Symbol ]

YOUR COSMIC PROFILE

"An Explorer Driven by Curiosity and Transformation"

Personalized summary text.

RESULTS SECTIONS

Create expandable premium cards.

1. Personality & Inner Nature

Include:

Personality tendencies

Emotional tendencies

Decision making

Communication style

2. Your Strengths

Display as beautiful cards.

Examples:

Natural curiosity

Adaptability

Persistence

Creativity

3. Growth Areas

Present gently.

Do not use fear-based language.

4. Planetary Influences

Create a horizontal scrollable card system.

Each card should contain:

Planet icon

Planet name

Traditional symbolic meaning

AI interpretation

5. Career & Ambition

Detailed analysis.

6. Money & Opportunities

Detailed analysis.

Do not give investment advice.

7. Relationships

Detailed analysis.

8. Education & Growth

Detailed analysis.

9. Spiritual Development

Detailed analysis.

10. Current Life Themes

Explain what areas of life may deserve focus.

Avoid guaranteed predictions.

11. Personalized Guidance

Create 5 elegant cards with practical suggestions.

Example:

"Focus Your Energy"

"Instead of chasing multiple directions simultaneously, consider choosing one major priority for the next few months."

CHAT WITH YOUR ASTROLOGY READING

At the bottom of the results page, add:

"Ask Your Astrology Guide"

The user can ask follow-up questions such as:

"What should I focus on in my career?"

"Explain Rahu and Ketu to me."

"What does my personality section mean?"

"Tell me more about relationships."

Maintain the birth information and original reading in temporary browser state.

Send the relevant context to Gemini through a secure API route.

Do not require login.

Limit context size intelligently.

EXPORT FEATURE

Add a button:

"Download My Reading"

Initially create a printable browser-friendly reading.

Use the browser print functionality.

Style the print view beautifully.

The downloaded/printed report should include:

User birth details

Reading date

All sections

Disclaimer

RESPONSIVE DESIGN

The website must work perfectly on:

Desktop

Laptop

Tablet

Mobile

Mobile is extremely important.

The form should be easy to complete on mobile.

Cards should stack properly.

Text should never overflow.

ANIMATIONS

Use Framer Motion.

Include:

Fade in

Slight upward movement

Smooth page transitions

Animated progress indicators

Hover effects on cards

Subtle glowing effects

Do NOT overdo animations.

Keep everything smooth and premium.

ACCESSIBILITY

Include:

Proper labels

Keyboard navigation

ARIA labels

Good contrast

Visible focus states

Accessible form validation

PRIVACY

Add a small privacy statement near the form:

"Your birth details are used only to generate this reading."

Since this version does not use a database:

Do not permanently store user birth information.

DISCLAIMER

At the bottom of every reading include:

"This reading is generated using AI and draws from traditional astrological concepts for reflective and informational purposes. Astrology is not scientifically established as a method for predicting future events. This experience should not replace professional medical, financial, legal or mental health advice."

CODE QUALITY

Generate clean, modular code.

Suggested structure:

components/
AstrologyForm.tsx
LoadingAnalysis.tsx
CosmicChart.tsx
ReadingHeader.tsx
ReadingSection.tsx
PlanetCard.tsx
FollowUpChat.tsx

app/
page.tsx
reading/page.tsx
api/
reading/route.ts
chat/route.ts

lib/
gemini.ts
prompts.ts
validation.ts

types/
astrology.ts

Use TypeScript types for all API responses.

Validate Gemini JSON responses safely.

If Gemini returns malformed JSON, handle it gracefully instead of crashing the website.

Do not expose API keys.

Do not create a complicated backend.

Use secure server-side API routes/serverless functions only.

FINAL PRODUCT GOAL

The final website should feel like a combination of:

A premium AI application

A modern astrology product

A personalized report generator

It should NOT look like:

A generic WordPress astrology site

A cheap horoscope generator

A cluttered spiritual website

A traditional government-style website

The most important priorities are:

Premium design

Excellent mobile experience

Smooth AI generation experience

Clear explanations

Personalized-feeling results

Secure Gemini integration

No exposed API keys

Minimal backend complexity

Clean modular code

Build the complete website now with all pages, components, API routes, loading states and Gemini integration scaffolding.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/af76ed0b-e87f-4f58-8056-a48e9a2825c0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
