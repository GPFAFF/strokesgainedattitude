// Course search — replaces the Firebase `searchCourses` callable.
//
// Runs server-side so course lookups are cached in Postgres and, if an
// OpenGolfAPI key is configured, it never has to be shipped in the app
// bundle. Reads (search + course detail) are keyless on OpenGolfAPI; a key
// only raises rate limits, so its absence degrades gracefully rather than
// failing.
//
// Deploy:  supabase functions deploy search-courses
// Secrets: supabase secrets set OPEN_GOLF_API_KEY=...   (optional)

import { createClient } from "jsr:@supabase/supabase-js@2";

const OPEN_GOLF_API_BASE = "https://api.opengolfapi.org/api/v1";
const MAX_RESULTS = 25;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type OpenGolfSearchResult = {
  id: string;
  course_name?: string;
  city?: string;
  state?: string;
  country_iso?: string;
  lat?: number;
  lng?: number;
};

type OpenGolfTee = {
  tee_name?: string;
  gender?: string;
  course_rating?: number;
  slope?: number;
  par?: number;
  yardage?: number;
};

type OpenGolfCourseDetail = OpenGolfSearchResult & {
  club_name?: string;
  holes?: number;
  tees?: OpenGolfTee[];
};

type TeeJson = {
  tee_name?: string;
  course_rating?: number | string;
  slope_rating?: number | string;
  par_total?: number | string;
  total_yards?: number | string;
  number_of_holes?: number;
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
  tees: { male?: TeeJson[]; female?: TeeJson[] };
  is_custom: boolean;
  search_index: string;
};

function authHeaders(apiKey?: string): HeadersInit {
  const headers: HeadersInit = { Accept: "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

function toTeesByGender(tees: OpenGolfTee[] | undefined, holes?: number) {
  const byGender: { male?: TeeJson[]; female?: TeeJson[] } = {};
  for (const t of tees ?? []) {
    const key = t.gender?.toLowerCase() === "female" ? "female" : "male";
    (byGender[key] ??= []).push({
      tee_name: t.tee_name,
      course_rating: t.course_rating,
      slope_rating: t.slope,
      par_total: t.par,
      total_yards: t.yardage,
      number_of_holes: holes,
    });
  }
  return byGender;
}

function toCourseRow(d: OpenGolfCourseDetail): CourseRow {
  return {
    id: `api-${d.id}`,
    name: d.course_name ?? "",
    club: d.club_name ?? null,
    city: d.city ?? null,
    state: d.state ?? null,
    country: d.country_iso ?? null,
    ...(d.lat !== undefined && { lat: d.lat }),
    ...(d.lng !== undefined && { lng: d.lng }),
    tees: toTeesByGender(d.tees, d.holes),
    is_custom: false,
    search_index: [d.course_name, d.club_name, d.city, d.state]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

async function searchOpenGolfApi(
  query: string,
  limit: number,
  apiKey?: string
): Promise<OpenGolfSearchResult[]> {
  const qs = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${OPEN_GOLF_API_BASE}/courses/search?${qs}`, {
    headers: authHeaders(apiKey),
  });
  if (!res.ok) {
    throw new Error(`OpenGolfAPI search ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  return Array.isArray(body?.courses) ? body.courses : [];
}

async function fetchCourseDetail(
  id: string,
  apiKey?: string
): Promise<OpenGolfCourseDetail | null> {
  const res = await fetch(`${OPEN_GOLF_API_BASE}/courses/${id}`, {
    headers: authHeaders(apiKey),
  });
  if (!res.ok) return null;
  return res.json();
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

    // Optional: raises OpenGolfAPI rate limits, but reads work without it.
    const apiKey = Deno.env.get("OPEN_GOLF_API_KEY");
    const needed = MAX_RESULTS - results.length;

    let fetched: CourseRow[] = [];
    try {
      const hits = await searchOpenGolfApi(query, needed, apiKey);

      // Search results carry no tee/rating data — that only comes from the
      // per-course detail endpoint, so fan out and fetch it for each hit.
      const details = await Promise.allSettled(
        hits.map((h) => fetchCourseDetail(h.id, apiKey))
      );

      fetched = details
        .map((r) => (r.status === "fulfilled" ? r.value : null))
        .filter((d): d is OpenGolfCourseDetail => !!d)
        .map(toCourseRow)
        .filter((c) => Object.keys(c.tees).length > 0);

      if (fetched.length) {
        const { error: upsertError } = await supabase
          .from("courses")
          .upsert(fetched, { onConflict: "id" });
        if (upsertError) console.error("Course cache upsert failed:", upsertError);
      }
    } catch (e) {
      // Upstream failure degrades to cached results rather than erroring out.
      console.error("OpenGolfAPI lookup failed:", e);
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
