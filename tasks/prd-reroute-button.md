# PRD: reroute button

## Introduction

A mobile-first PWA where bored people press a single button and get "rerouted" to a random interesting place in their city. The app picks a surprise destination, opens Uber or Lyft with the destination pre-filled, and logs the trip. Users can rate spots, submit new ones, and see where others got rerouted.

The core insight: it removes decision paralysis. It's not "where should I go?" — it's "you're going. get in."

Inspired by a viral project where someone wired a physical Raspberry Pi button that books an Uber to a random interesting spot whenever they're bored.

## Goals

- Deliver the "one tap to adventure" core loop with zero friction
- Build a curated, high-quality database of interesting spots (starting with Denver)
- Make it social: community-submitted spots, public trip feed, and trip notes
- Ship as an installable PWA that feels native on mobile
- Time-aware and budget-aware destination selection
- Ship with clear safety guardrails and moderation policy

## Safety, Trust, and Legal

- The app is for adults (18+) in V1.
- Users must acknowledge a short disclaimer before first use: destinations are suggestions, and users are responsible for personal safety and judgment.
- The app does not guarantee venue safety, accessibility, open hours, or transport availability.
- Every destination reveal includes an immediate **Cancel** action and a **Re-roll** action (limited; see algorithm section) so users never feel trapped.
- Prohibited spot types: private residences, illegal venues, dangerous/inaccessible locations, and places that violate local laws.
- Users can report unsafe/incorrect spots; reported spots are auto-queued for admin review.

## User Stories

### US-001: Set up database schema and seed data pipeline
**Description:** As a developer, I need a database schema for spots, profiles, trips, and moderation so the app has persistent storage.

**Acceptance Criteria:**
- [ ] Schema includes: `spots` (name, description, category, lat/lng, city, hours, tags, submitted_by, upvotes, status), `profiles` (id, name, email, avatar, home_location, city, budget_max, is_admin, created_at), `trips` (id, user_id, spot_id, status, rating, notes, is_public, created_at), `spot_votes` (user_id, spot_id), `spot_reports` (user_id, spot_id, reason, created_at)
- [ ] `trips.status` supports: 'suggested' | 'ride_clicked' | 'completed' (V1 may primarily use `ride_clicked`)
- [ ] Spots have a `status` field: 'approved' | 'pending' | 'rejected'
- [ ] Seed script generates 50 Denver spots using Claude API, outputs JSON for manual review
- [ ] Reviewed/approved spots can be imported into the database
- [ ] Typecheck/lint passes

### US-002: User authentication
**Description:** As a user, I want to sign in so my trips and submitted spots are tied to my account.

**Acceptance Criteria:**
- [ ] OAuth sign-in with Google (V1 primary)
- [ ] Apple OAuth explicitly deferred to V1.1
- [ ] New users prompted to set home location (used for ride estimates)
- [ ] Profile stores: name, avatar, home location (lat/lng), city, budget
- [ ] Session persists across browser refreshes
- [ ] Typecheck/lint passes

### US-003: The reroute button
**Description:** As a user, I want to press a single big button and immediately get a random interesting destination so I stop overthinking and just go.

**Acceptance Criteria:**
- [ ] Home screen is dominated by a single large "reroute me" button
- [ ] Pressing it selects a random approved spot in the user's city
- [ ] Selection is time-aware: filters out spots that are closed or inappropriate for current time of day
- [ ] Selection excludes spots the user has visited in the last 30 days
- [ ] Spot is revealed with a fun animation/transition (destination name + category + short description)
- [ ] Reveal includes **Cancel** and **Re-roll** actions (max 1 re-roll in V1)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-004: Budget filter
**Description:** As a user, I want to set a max ride budget so I don't get sent somewhere I can't afford to reach.

**Acceptance Criteria:**
- [ ] Settings screen with a budget slider ($5 - $50+ / no limit)
- [ ] Budget preference persists in profile
- [ ] Spot selection estimates ride cost using straight-line distance from user's home location as a proxy (actual Uber API pricing not needed for V1 — use ~$1.50/mile heuristic)
- [ ] Spots beyond budget are filtered out before random selection
- [ ] If no spots match budget, show friendly message suggesting increasing budget
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-005: Ride booking deep links
**Description:** As a user, after seeing my destination I want to book a ride with one tap via Uber or Lyft.

**Acceptance Criteria:**
- [ ] After destination reveal, show two buttons: "Uber" and "Lyft"
- [ ] Uber button opens Uber deep link with destination lat/lng pre-filled (`uber://?action=setPickup&dropoff[latitude]=X&dropoff[longitude]=Y&dropoff[nickname]=SpotName`)
- [ ] Lyft button opens Lyft deep link with destination pre-filled (`lyft://ridetype?id=lyft&destination[latitude]=X&destination[longitude]=Y`)
- [ ] Fallback: if deep link fails (app not installed), redirect to Uber/Lyft web fallback or store
- [ ] A trip record is created/updated to `status='ride_clicked'` when user taps either ride button
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-006: Trip history and ratings
**Description:** As a user, I want to see everywhere I've been rerouted and rate each trip so I can track my adventures.

**Acceptance Criteria:**
- [ ] "My Trips" tab showing chronological list of past trips
- [ ] Each trip shows: spot name, category, date, rating (if set), status
- [ ] Tap a trip to expand: see spot description, your notes, your rating
- [ ] 1-5 star rating system, settable after the trip
- [ ] Optional text notes field per trip
- [ ] Trip count displayed on profile ("rerouted 11 times")
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-007: Submit a spot
**Description:** As a user, I want to submit interesting places I know about so others can discover them.

**Acceptance Criteria:**
- [ ] "Submit a Spot" form accessible from navigation
- [ ] Fields: name, description, category (dropdown), address (geocoded to lat/lng), hours/availability, tags
- [ ] Categories: food, outdoors, culture, nightlife, weird, hidden gem, historic, activity
- [ ] Submitted spots go to 'pending' status
- [ ] Submitter sees their pending spots in their profile
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-008: Spot moderation (admin)
**Description:** As an admin, I want to approve or reject community-submitted spots to maintain quality.

**Acceptance Criteria:**
- [ ] Admin dashboard at `/admin` (protected route, admin role check)
- [ ] List of pending spots with approve/reject actions
- [ ] Approved spots enter the active pool immediately
- [ ] Rejected spots removed from queue with optional reason
- [ ] Reported spots are visible with report reason and reporter count
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-009: Upvote spots
**Description:** As a user, I want to upvote spots I enjoyed so the best places rise to the top.

**Acceptance Criteria:**
- [ ] After completing a trip, upvote button appears on the spot
- [ ] Users can also upvote from the public feed
- [ ] One upvote per user per spot (toggle on/off)
- [ ] Upvote count visible on spot cards
- [ ] Higher-upvoted spots have a higher probability of being selected by the reroute algorithm
- [ ] Weighting includes a cap to avoid runaway popularity bias
- [ ] Typecheck/lint passes

### US-010: Public feed — "reroute Map"
**Description:** As a user, I want to see where others got rerouted so I feel part of a community of adventurers.

**Acceptance Criteria:**
- [ ] "Feed" tab showing recent trips from all users in the same city
- [ ] Each feed item shows: user avatar/name, spot name, category, time ago, rating, notes (if public)
- [ ] Optional: map view showing pins of recent reroutes (deferred to V1.1)
- [ ] Users can toggle their trips between public and private (default: public)
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-011: PWA setup and installability
**Description:** As a user, I want to install the app on my home screen so it feels like a native app.

**Acceptance Criteria:**
- [ ] Valid web app manifest with app name ("reroute"), icons, theme color
- [ ] Service worker for offline shell (app loads even without network, shows cached UI)
- [ ] "Add to Home Screen" prompt appears on supported browsers
- [ ] Splash screen on launch
- [ ] Standalone display mode (no browser chrome)
- [ ] Offline behavior is explicit: home UI and nav load; no new reroute selection without network
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

### US-012: Location and city detection
**Description:** As a user, I want the app to know my city so it shows relevant spots without me having to configure anything.

**Acceptance Criteria:**
- [ ] On first launch, request geolocation permission
- [ ] Reverse geocode to detect city
- [ ] User can manually change city in settings
- [ ] Spots are filtered to user's city
- [ ] Typecheck/lint passes

## Functional Requirements

- FR-1: The home screen must be a single full-screen button that triggers random spot selection
- FR-2: Spot selection algorithm must filter by: city match, time-awareness (spot hours vs current time), budget (estimated ride cost vs user preference), recency (not visited in last 30 days), and status (approved only)
- FR-3: Selection probability must be weighted by upvote count (more upvotes = higher chance, but not deterministic), with a cap to preserve variety
- FR-4: After selection, display destination with ride booking options (Uber + Lyft deep links)
- FR-5: Each ride booking click creates/updates a trip record in the database (`status='ride_clicked'`)
- FR-6: Users can rate trips (1-5 stars) and add text notes after the fact
- FR-7: Users can submit new spots for moderation
- FR-8: Admins can approve/reject submitted spots from an admin dashboard
- FR-9: Public feed shows recent public trips from all users in the same city
- FR-10: Budget filter uses distance-based heuristic ($1.50/mile) for V1
- FR-11: PWA must be installable with offline shell support and clearly defined offline limits
- FR-12: Seed data pipeline generates spots via Claude API for manual review before import
- FR-13: Users can report problematic spots; reports are visible in moderation queue
- FR-14: Re-roll is supported once per reroute session to preserve surprise while preventing paralysis

## Canonical Data Model (V1)

- `profiles` (1:1 with `auth.users`): user metadata, home location, city, budget, admin flag
- `spots`: curated/community destinations, moderation status, upvote count, hours, tags
- `trips`: user + selected spot + status (`suggested`/`ride_clicked`/`completed`), rating, notes, visibility
- `spot_votes`: unique user/spot upvotes
- `spot_reports`: safety/inaccuracy reports for moderation

Naming convention: use `profiles` consistently in product and technical docs (not `users` as a standalone app table).

## Algorithm Spec (V1)

Filter order:
1. `status = approved`
2. `city = user.city`
3. Open-now check against spot hours (timezone-aware by city timezone)
4. Recency exclusion (visited in last 30 days)
5. Budget exclusion using distance × $1.50/mile

Selection:
- Weight formula: `weight = min(1 + upvotes, 6)`
- Weighted random over final candidate set
- Deduplicate near-identical spots (same normalized name + within 0.1 miles)

Fallback behavior:
- If no candidates: relax recency first, then suggest budget increase, then suggest city override
- Unknown/missing hours are allowed but receive reduced weight (e.g., 0.75x)
- User may re-roll once; second result cannot be the first result

## Privacy & Moderation

- Trip visibility default: public (`is_public=true`), user-editable per trip
- Notes are public only when trip is public
- Feed excludes private trips
- Users can report spots with reason: unsafe, closed, incorrect info, duplicate, other
- Admin moderation SLA target: reports triaged within 72 hours
- Basic abuse controls: rate-limit submissions and reports per user/IP
- Data controls: users can delete their own notes/ratings and request account/data deletion

## Non-Goals

- No real-time Uber/Lyft pricing (use distance heuristic for V1)
- No in-app ride tracking or status updates
- No payment processing
- No push notifications (V1)
- No multi-city browse/explore mode (city override still allowed)
- No physical button / IoT integration (that's the inspiration, not the product)
- No native mobile app (PWA only for V1)
- No algorithmic "you might like" recommendations (random is the feature)
- No full map-first discovery experience in V1

## Design Considerations

- The button must feel urgent, fun, slightly dangerous — like you're actually getting rerouted
- Dark theme preferred — this is a nightlife-friendly app
- Minimal UI. The home screen is the button. Everything else is secondary
- Destination reveal should feel like unwrapping a surprise (animation + short suspense)
- Trip history should feel like a travel journal / adventure log
- The overall vibe: chaotic good energy
- Safety affordances (Cancel/Re-roll/report) must be obvious without cluttering the core loop

## Technical Considerations

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Database:** Supabase (Postgres + Auth + Realtime)
- **Auth:** Supabase Auth with Google OAuth in V1; Apple OAuth in V1.1
- **Styling:** Tailwind CSS 4
- **Geocoding:** Browser Geolocation API + reverse geocoding via Nominatim
- **Deep links:** Uber and Lyft URL schemes (no API key needed)
- **Spot generation:** Claude API for initial seed data, output to JSON for human review
- **Deployment:** Vercel
- **PWA:** next-pwa or manual service worker setup
- **Observability:** basic analytics/events for button press, reroute success, no-result, ride-click, reroll, and reports

## Success Metrics

- User presses the button within 5 seconds of opening the app (zero friction)
- 50+ seed spots for Denver at launch
- Users complete the full loop (button press -> ride clicked) in under 15 seconds
- 70%+ of ride-clicked trips get rated (proxy for engagement)
- Community submits 10+ spots in first month
- **No-result rate** (reroute request with zero eligible spots) < 10%
- **Ride click-through rate** (destination reveal -> Uber/Lyft tap) > 35%
- **Moderation latency** for pending submissions/reports median < 72 hours
- **Reroll usage rate** < 25% (guardrail against decision paralysis returning)

## Launch Plan (Denver V1)

- Pre-launch: seed 50+ Denver spots, manual QA each for category, coordinates, and hours sanity
- Soft launch: invite-only cohort to validate algorithm/no-result rate and moderation load
- Public launch: enable submissions and feed after moderation queue stability is confirmed
- Rollback plan: if spot quality or safety reports spike, temporarily limit selection pool to curated-only approved seeds

## Open Questions

- Should there be a paid "premium chaos" mode with thematic filters (e.g., date night, solo chill)?
- Should completion ever be inferred automatically (e.g., arrived near destination) in later versions?
- At what threshold do we add trusted submitters and community moderators?
- How often should approved spots be re-verified for closure/quality drift?
