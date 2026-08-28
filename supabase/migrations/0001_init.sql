-- Strokes Gained Attitude — initial schema
--
-- Replaces the Firestore collections:
--   users              -> public.profiles
--   courses            -> public.courses
--   mentalRounds       -> public.rounds + public.round_scores
--   mentalCategoryStats-> the stats VIEWs below (no trigger needed)
--
-- The key modelling change: ratings are stored one row per concept in
-- round_scores rather than as a map on the round. That turns every "how does
-- mindset relate to scoring" question into ordinary SQL, and removes the
-- aggregateMentalCategories Cloud Function (and its whole class of bugs).

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────────

create table public.profiles (
  id               uuid primary key references auth.users on delete cascade,
  email            text,
  display_name     text,
  handicap         numeric(4, 1),
  profile_complete boolean     not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.profiles is
  'One row per auth user. Created automatically by handle_new_user().';

-- ─────────────────────────────────────────────────────────────────────────────
-- courses
--
-- Shared cache of GolfCourse API results plus user-submitted custom courses.
-- API rows are written by the search-courses edge function (service role);
-- custom rows are written by the owning user.
-- ─────────────────────────────────────────────────────────────────────────────

create table public.courses (
  id           text primary key default ('custom-' || gen_random_uuid()::text),
  name         text not null,
  club         text,
  city         text,
  state        text,
  country      text,
  lat          double precision,
  lng          double precision,
  -- { "male": [ {tee_name, course_rating, slope_rating, par_total, ...} ], "female": [...] }
  tees         jsonb       not null default '{}'::jsonb,
  is_custom    boolean     not null default false,
  created_by   uuid references auth.users on delete set null,
  search_index text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index courses_search_index_idx on public.courses (search_index text_pattern_ops);
create index courses_created_by_idx  on public.courses (created_by);

-- ─────────────────────────────────────────────────────────────────────────────
-- rounds
-- ─────────────────────────────────────────────────────────────────────────────

create table public.rounds (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  played_at     timestamptz not null default now(),

  -- Course details are snapshotted, not just referenced: a round is a
  -- historical record and must survive the course row changing or going away.
  course_id     text references public.courses on delete set null,
  course_name   text,
  course_city   text,
  course_state  text,
  tee           jsonb,

  round_score          integer check (round_score between 18 and 200),
  putts                integer check (putts >= 0),
  fairways_hit         integer check (fairways_hit >= 0),
  greens_in_regulation integer check (greens_in_regulation >= 0),

  -- (Score - Course Rating) x 113 / Slope, per the USGA formula. Generated so
  -- it can never drift from its inputs. Ratings arrive from an external API as
  -- text, so guard the cast with a numeric-shape check: anything unparseable
  -- yields NULL rather than failing the insert.
  handicap_differential numeric(4, 1) generated always as (
    case
      when round_score is null then null
      when coalesce(tee ->> 'course_rating', '') !~ '^[0-9]+(\.[0-9]+)?$' then null
      when coalesce(tee ->> 'slope_rating',  '') !~ '^[0-9]+(\.[0-9]+)?$' then null
      when (tee ->> 'slope_rating')::numeric = 0 then null
      else round(
        ((round_score - (tee ->> 'course_rating')::numeric) * 113)
        / (tee ->> 'slope_rating')::numeric,
        1
      )
    end
  ) stored,

  created_at timestamptz not null default now()
);

create index rounds_user_played_idx on public.rounds (user_id, played_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- round_scores — one row per rated concept
-- ─────────────────────────────────────────────────────────────────────────────

create table public.round_scores (
  round_id uuid    not null references public.rounds on delete cascade,
  concept  text    not null,
  category text    not null,
  score    integer not null check (score between 1 and 5),
  primary key (round_id, concept)
);

create index round_scores_category_idx on public.round_scores (category);

-- ─────────────────────────────────────────────────────────────────────────────
-- Stats views — these replace the aggregateMentalCategories trigger entirely.
--
-- security_invoker makes the views run with the *querying* user's permissions,
-- so the RLS policies on the base tables apply. Without it a view owned by the
-- postgres role would happily return every user's rows.
-- ─────────────────────────────────────────────────────────────────────────────

create view public.user_concept_stats
  with (security_invoker = true) as
select
  r.user_id,
  rs.category,
  rs.concept,
  round(avg(rs.score)::numeric, 2) as average,
  count(*)                         as rounds_counted
from public.round_scores rs
join public.rounds r on r.id = rs.round_id
group by r.user_id, rs.category, rs.concept;

create view public.user_category_stats
  with (security_invoker = true) as
select
  r.user_id,
  rs.category,
  round(avg(rs.score)::numeric, 2) as average,
  count(*)                         as ratings_counted,
  count(distinct r.id)             as rounds_counted
from public.round_scores rs
join public.rounds r on r.id = rs.round_id
group by r.user_id, rs.category;

-- Per-category mindset vs scoring. This is the query the whole product is
-- about, and it is one view instead of a fan-out of Cloud Function reads.
create view public.user_category_performance
  with (security_invoker = true) as
select
  r.user_id,
  rs.category,
  case when rs.score >= 4 then 'high' else 'low' end as band,
  count(distinct r.id)                        as rounds_counted,
  round(avg(r.round_score)::numeric, 1)       as avg_score,
  round(avg(r.handicap_differential), 1)      as avg_differential
from public.round_scores rs
join public.rounds r on r.id = rs.round_id
where r.round_score is not null
group by r.user_id, rs.category, band;

-- ─────────────────────────────────────────────────────────────────────────────
-- Triggers
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger courses_touch_updated_at
  before update on public.courses
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- Grants
--
-- A hosted Supabase project sets default privileges that would grant these
-- automatically, but stating them makes the intent explicit and keeps the
-- migration portable to self-hosted setups. anon gets nothing: every table here
-- requires a signed-in user, and RLS alone shouldn't be the only thing standing
-- between an anonymous request and the data.
-- ─────────────────────────────────────────────────────────────────────────────

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.rounds       to authenticated;
grant select, insert, update, delete on public.round_scores to authenticated;
grant select, insert, update, delete on public.courses      to authenticated;
grant select, update                 on public.profiles     to authenticated;

grant select on public.user_concept_stats        to authenticated;
grant select on public.user_category_stats       to authenticated;
grant select on public.user_category_performance to authenticated;

revoke all on public.profiles, public.rounds, public.round_scores, public.courses from anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.profiles     enable row level security;
alter table public.courses      enable row level security;
alter table public.rounds       enable row level security;
alter table public.round_scores enable row level security;

-- profiles: you can see and edit only yourself. No insert policy — rows come
-- from the handle_new_user trigger. No delete — that cascades from auth.users.
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- courses: the cache is shared reference data, readable by any signed-in user.
-- Writes are limited to your own custom courses; API rows are upserted by the
-- edge function under the service role, which bypasses RLS.
create policy "courses: read all when signed in"
  on public.courses for select
  to authenticated
  using (true);

create policy "courses: insert own custom"
  on public.courses for insert
  to authenticated
  with check (is_custom = true and created_by = auth.uid());

create policy "courses: update own custom"
  on public.courses for update
  to authenticated
  using (is_custom = true and created_by = auth.uid())
  with check (is_custom = true and created_by = auth.uid());

create policy "courses: delete own custom"
  on public.courses for delete
  to authenticated
  using (is_custom = true and created_by = auth.uid());

-- rounds: strictly your own.
create policy "rounds: read own"
  on public.rounds for select
  using (auth.uid() = user_id);

create policy "rounds: insert own"
  on public.rounds for insert
  with check (auth.uid() = user_id);

create policy "rounds: update own"
  on public.rounds for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "rounds: delete own"
  on public.rounds for delete
  using (auth.uid() = user_id);

-- round_scores: ownership is inherited through the parent round.
create policy "round_scores: read own"
  on public.round_scores for select
  using (exists (
    select 1 from public.rounds r
    where r.id = round_scores.round_id and r.user_id = auth.uid()
  ));

create policy "round_scores: insert own"
  on public.round_scores for insert
  with check (exists (
    select 1 from public.rounds r
    where r.id = round_scores.round_id and r.user_id = auth.uid()
  ));

create policy "round_scores: update own"
  on public.round_scores for update
  using (exists (
    select 1 from public.rounds r
    where r.id = round_scores.round_id and r.user_id = auth.uid()
  ));

create policy "round_scores: delete own"
  on public.round_scores for delete
  using (exists (
    select 1 from public.rounds r
    where r.id = round_scores.round_id and r.user_id = auth.uid()
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- Self-service account deletion
--
-- Supabase has no client-side API for deleting your own auth user — removing a
-- row from auth.users needs the service role, which must never reach the app.
-- SECURITY DEFINER lets this run with the owner's rights while the WHERE clause
-- pins it to the caller, so a user can only ever delete themselves. If
-- auth.uid() is NULL (an unauthenticated or service-role call) the predicate is
-- NULL for every row and nothing is deleted.
--
-- profiles, rounds, round_scores and the created_by link on custom courses all
-- cascade from auth.users, so this one delete removes the account outright.
-- App stores require in-app account deletion, so this is not optional.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.delete_current_user()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

-- Deny by default, then grant only to signed-in users: a SECURITY DEFINER
-- function is executable by PUBLIC unless revoked.
revoke all on function public.delete_current_user() from public, anon;
grant execute on function public.delete_current_user() to authenticated;
