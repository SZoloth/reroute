# Supabase Migration + Verification Runbook

This runbook applies the latest schema changes (including `004_create_public_profiles.sql`) and verifies feed/privacy behavior.

## 1) Apply migrations

From repo root:

```bash
cd /Users/samzoloth/Projects/reroute

# If needed (once per machine)
supabase login

# Link to the project (if not already linked)
# Current project ref: ubdtjqcuqezrtxxfkkoy
supabase link --project-ref ubdtjqcuqezrtxxfkkoy

# Optional: see migration state
supabase migration list

# Apply all pending local migrations to remote
supabase db push
```

## 2) Schema verification (SQL)

Run in Supabase SQL Editor (or via psql):

```sql
-- Quick RLS/policy/function/trigger validation
\i supabase/rls-verification.sql
```

If you cannot use `\i`, paste the contents of `supabase/rls-verification.sql` directly into SQL Editor.

### Expected highlights

- `public_profiles` exists and has RLS enabled
- policy `public_profiles_select_authenticated` exists
- `profiles_select_authenticated` is restricted to `id = auth.uid()`
- function `sync_public_profile` exists
- trigger `profiles_sync_public_profile` exists on `public.profiles`

## 3) App verification checklist

Run app locally:

```bash
pnpm dev
```

Then verify in browser:

1. Sign in as user A, create/complete a trip, ensure it appears in Feed.
2. Feed line should show user name from `public_profiles` (not fallback `Someone`).
3. Sign in as user B in same city, Feed should still render names correctly.
4. Confirm own Profile page still works (name/city/trip count).

## 4) Safety checks before/after deploy

```bash
pnpm typecheck
pnpm test
```

Both should pass before promoting.
