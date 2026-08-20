# Supabase setup

The app talks to Postgres directly (through PostgREST) plus one edge function.
There is no server to run.

## 1. Create the project

Create a project at [supabase.com](https://supabase.com), then note the
**Project URL** and **anon key** from Settings → API.

## 2. Apply the schema

Either paste `migrations/0001_init.sql` into the SQL Editor, or use the CLI:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

This creates `profiles`, `courses`, `rounds`, `round_scores`, the three stats
views, the `handle_new_user` trigger, and every RLS policy.

## 3. Deploy the course search function

```bash
supabase functions deploy search-courses
supabase secrets set GOLF_COURSE_API_KEY=<your golfcourseapi.com key>
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.

## 4. Point the app at the project

In `app/app.json`, replace the placeholders under `expo.extra`:

```json
"supabaseUrl": "https://<project-ref>.supabase.co",
"supabaseAnonKey": "<anon key>"
```

The anon key is safe to ship — it only grants what RLS allows. The **service
role** key must never appear in the app.

## 5. Auth settings

**Redirect URLs.** Password reset and email confirmation open the app via its
URL scheme. Under Authentication → URL Configuration, add these to the allowed
redirect list, or the links will bounce:

```
strokesgainedattitude://auth/reset
strokesgainedattitude://auth/confirm
```

For Expo Go during development also add `exp://` — `Linking.createURL()`
returns an `exp://…` URL there rather than the custom scheme.

**Email confirmation.** On by default, which means signup issues no session
until the user clicks the emailed link. The signup screen handles this (it
shows a "check your inbox" state), so either setting works. Turning off
"Confirm email" under Authentication → Providers → Email makes beta onboarding
one step shorter; leaving it on is the safer choice for a public launch.

---

## Schema notes

**Ratings are rows, not a map.** `round_scores` holds one row per rated concept.
That is what makes the stats views possible — and why the old
`aggregateMentalCategories` Cloud Function is gone. Nothing is maintained on
write, so aggregates can't drift from the underlying ratings.

**`handicap_differential` is a generated column.** Postgres derives it from
`round_score` and the tee's rating/slope on every write. It is not insertable.
Ratings arrive from the GolfCourse API as text, so the expression checks the
numeric shape first — unparseable or zero-slope values yield `NULL` rather than
failing the insert.

**Views run as the caller.** All three stats views are declared
`WITH (security_invoker = true)` so the base tables' RLS applies. Without that
flag a view owned by `postgres` would return every user's rows.

**`anon` is denied at the grant level**, not just by policy — an unauthenticated
request gets `permission denied` before RLS is consulted.

## Verifying RLS

The policies were checked against a local Postgres 16 by seeding two users and
querying as each:

- each user sees only their own rounds, ratings, profile, and stats
- inserting a round for another `user_id` → `violates row-level security policy`
- attaching `round_scores` to someone else's round → violation
- updating another user's round → affects 0 rows
- `anon` → `permission denied for table rounds`

Worth re-running after any policy change.

## Follow-ups

- **`delete-account` edge function.** `useDeleteAccount` deletes all of the
  user's rows and signs them out, then calls a `delete-account` function to
  remove the `auth.users` record. Removing an auth user needs the service role,
  so it has to live server-side. Until it is deployed the client logs a warning
  and the auth record survives — fine for beta, needs doing before app-store
  submission, which requires full in-app account deletion.
