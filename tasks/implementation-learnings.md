# Implementation Learnings (TDD + Review Loop)

## Architecture
- Keep route handlers dependency-injected where possible (`create*Handler`) so route behavior can be tested without Supabase wiring.
- Pure domain logic (`selectRerouteSpot`, `buildRerouteContextForUser`) should remain framework-agnostic and easy to test.

## Next.js 16
- Use `proxy.ts` instead of `middleware.ts` to avoid deprecation warnings.
- Move `themeColor` into `viewport` export (not `metadata`) to avoid build warnings.

## Product rules now enforced
- One reroll maximum per session in both UI state and API (`rerollCount` + server guard).
- Rerolls cannot return the same spot (`excludeSpotId`/`excludedSpotIds`).
- Trip creation happens before ride redirect from destination reveal.

## External API hardening
- Nominatim requests now use timeout/abort handling and graceful fallback behavior.
- Claude seed generation parser now extracts JSON robustly from fenced or mixed text output.

## Completed hardening pass
- Added route tests for `/api/trips/[id]`, `/api/spots/[id]`, `/api/profile/onboarding`, and `/api/profile/settings`.
- Introduced shared server auth helpers in `src/lib/server/auth.ts` and reused them across routes.
- Added server-side onboarding guard on `/` and auth gates for `/settings` and `/submit`.
- Tightened validation in mutable endpoints (rating bounds, required fields, empty-update guards).

## Completed release polish
- Replaced placeholder PWA icons with generated branded assets (`public/icon-192.png`, `public/icon-512.png`) and added `scripts/generate-icons.ts`.
- Added browser smoke tests with Playwright (`e2e/smoke.spec.ts`) and `playwright.config.ts`.
- Added `smoke:e2e` script and validated smoke flow plus unauthenticated route redirects.

## Completed additional hardening
- Added RLS policy migration (`supabase/migrations/003_enable_rls_and_policies.sql`) and verification query pack (`supabase/rls-verification.sql`).
- Added spot-report endpoint and tests (`/api/spots/[id]/report`) plus report UI trigger on destination reveal.
- Added optional authenticated Playwright flow using Supabase email/password creds (`e2e/authenticated.supabase.spec.ts`).
- Added visual regression snapshots with Playwright (`e2e/visual.spec.ts`) for home idle + destination reveal.
- Added `allowedDevOrigins` config to reduce Next.js dev-origin warning noise in local E2E runs.

## Remaining quality opportunities
- Add onboarding snapshot and trip-history snapshot coverage.
- Add CI pipeline step for `playwright test` with snapshot update policy and artifact retention.
