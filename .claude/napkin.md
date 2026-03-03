# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|
| 2026-03-01 | self | QA codex output referenced unrelated files (`ralph-run.sh`) | Manually validate repo-specific changes instead of trusting codex blindly |

## User Preferences
- Ship fast: "ok commit push ship" = commit, push, deploy in one go
- Conventional commits enforced by hooks

## Patterns That Work
- TDD per issue: write failing test, then minimal fix — keeps changes focused
- Supabase SSR: `setAll` in server.ts needs try/catch — server components can't set cookies, middleware handles refresh
- `pointer-events-none` on fixed overlay sections that animate off-screen — prevents invisible click-blocking
- API error responses: always include both `error` (machine) and `message` (human-friendly) fields
- `Promise.race` with timeout for browser APIs that can hang (geolocation)
- Check response status codes (401) instead of string matching error messages for conditional UI

## Patterns That Don't Work
- `string.includes("Unauthorized")` for detecting auth errors — brittle, breaks when messages change
- Server component redirects for auth without try/catch on cookie operations — causes false redirects for authenticated users

## Domain Notes
- Vercel project is still named "kidnap" (pre-rebrand), prod URL: kidnap.vercel.app
- Env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY — all set for Production + Preview
- Supabase project ref: ubdtjqcuqezrtxxfkkoy
- Playwright config uses fake supabase URL for E2E — don't confuse with prod
- Profile page handles `!user` gracefully (shows message), settings page redirects — different UX patterns
- Bottom nav: 4-tab grid (Home, Feed, Trips, Profile). Settings accessible from Profile page.
