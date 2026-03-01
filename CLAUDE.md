# reroute button

Mobile-first PWA where users press a button and get "rerouted" to a random interesting place in their city via Uber/Lyft.

## Stack
- Next.js 16 (App Router) + TypeScript
- Supabase (Postgres + Auth + Realtime)
- Tailwind CSS 4
- Vercel (deployment)
- PWA (installable, offline shell)

## Key Concepts
- **The Button**: Single full-screen "reroute me" button on home screen. Zero friction.
- **reroute algorithm**: Weighted random selection filtered by city, time-awareness, budget, recency (not visited in 30 days). Weight = 1 + upvotes.
- **Ride Deep Links**: Uber + Lyft URL schemes, no API key needed. Web fallbacks for users without apps installed.
- **Budget Heuristic**: $1.50/mile straight-line distance. No real Uber pricing API.
- **Spot Pipeline**: Claude API generates seed spots → JSON → manual review → import to Supabase.

## Project Structure
- `tasks/prd-reroute-button.md` — full PRD
- `tasks/prd.json` — 23 execution tasks ordered by dependency
- `scripts/` — seed data generation and import scripts (TBD)
- `supabase/migrations/` — database schema (TBD)

## Design
- Dark theme (nightlife-friendly)
- Minimal UI — the home screen IS the button
- "Chaotic good" energy
- Destination reveal should feel like unwrapping a surprise

## External Services
- Supabase: database, auth (Google OAuth), realtime
- Nominatim: free reverse geocoding (OpenStreetMap)
- Claude API: seed spot generation
