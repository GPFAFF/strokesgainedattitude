// Course search — replaces the Firebase `searchCourses` callable.
//
// Runs server-side so the GolfCourse API key is never shipped in the app
// bundle. Results are cached into public.courses using the service role (which
// bypasses RLS) so the next search for the same query is served from Postgres.
//
// Deploy:  supabase functions deploy search-courses
// Secrets: supabase secrets set GOLF_COURSE_API_KEY=...

import { createClient } from "jsr:@supabase/supabase-js@2";

const GOLF_API_BASE = "https://api.golfcourseapi.com/v1";
const MAX_RESULTS = 25;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type GolfApiCourse = {
  id: number | string;
  course_name?: string;
  club_name?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  tees?: Record<string, unknown>;
};

type CourseRow = {
  id: string;
  name: string;
  club: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  lat?: number;
  lng?: number;
  tees: Record<string, unknown>;
  is_custom: boolean;
  search_index: string;
};

function toCourseRow(c: GolfApiCourse): CourseRow {
  return {
    id: `api-${c.id}`,
    name: c.course_name ?? "",
    club: c.club_name ?? null,
    city: c.location?.city ?? null,
    state: c.location?.state ?? null,
    country: c.location?.country ?? null,
    ...(c.location?.latitude !== undefined && { lat: c.location.latitude }),
    ...(c.location?.longitude !== undefined && { lng: c.location.longitude }),
    tees: (c.tees ?? {}) as Record<string, unknown>,
    is_custom: false,
    search_index: [
      c.course_name,
      c.club_name,
      c.location?.city,
      c.location?.state,
      c.location?.country,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

async function searchGolfApi(query: string, apiKey: string): Promise<GolfApiCourse[]> {
  const qs = new URLSearchParams({ search_query: query });
  const res = await fetch(`${GOLF_API_BASE}/search?${qs}`, {
    headers: { Authorization: `Key ${apiKey}`, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`GolfCourse API ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  return Array.isArray(body?.courses) ? body.courses : [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  try {
    const { search_query } = await req.json().catch(() => ({}));
    const query = typeof search_query === "string" ? search_query.trim() : "";
    if (!query) return json({ error: "`search_query` is required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Cache first.
    const { data: cached, error: cacheError } = await supabase
      .from("courses")
      .select("*")
      .ilike("search_index", `%${query.toLowerCase()}%`)
      .limit(MAX_RESULTS);

    if (cacheError) throw cacheError;

    const results = cached ?? [];
    if (results.length >= MAX_RESULTS) return json(results);

    // Top up from the upstream API.
    const apiKey = Deno.env.get("GOLF_COURSE_API_KEY");
    if (!apiKey) {
      // Missing key shouldn't break search outright — serve what we cached.
      console.error("GOLF_COURSE_API_KEY is not set");
      return json(results);
    }

    let fetched: CourseRow[] = [];
    try {
      const upstream = await searchGolfApi(query, apiKey);
      fetched = upstream
        .filter((c) => c.tees && Object.keys(c.tees).length > 0)
        .slice(0, MAX_RESULTS - results.length)
        .map(toCourseRow);

      if (fetched.length) {
        const { error: upsertError } = await supabase
          .from("courses")
          .upsert(fetched, { onConflict: "id" });
        if (upsertError) console.error("Course cache upsert failed:", upsertError);
      }
    } catch (e) {
      // Upstream failure degrades to cached results rather than erroring out.
      console.error("GolfCourse API lookup failed:", e);
      return json(results);
    }

    // Merge, preferring a user's custom entry over the API's version.
    const merged = new Map<string, CourseRow>();
    for (const c of [...fetched, ...(results as CourseRow[])]) {
      const key = `${c.name}-${c.city ?? ""}-${c.state ?? ""}`.toLowerCase();
      const existing = merged.get(key);
      if (!existing || (!existing.is_custom && c.is_custom)) merged.set(key, c);
    }

    return json([...merged.values()]);
  } catch (e) {
    console.error("search-courses failed:", e);
    return json({ error: "Course search failed" }, 500);
  }
});
