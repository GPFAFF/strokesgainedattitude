// services/golfbert.ts
const BASE = "https://api.golfbert.com/v1";
const API_KEY = process.env.EXPO_PUBLIC_GOLFBERT_KEY; // ← keep in .env
const ACCESS = process.env.EXPO_PUBLIC_GOLFBERT_ACCESS; // AWS access-key
const SECRET = process.env.EXPO_PUBLIC_GOLFBERT_SECRET; // AWS secret

export interface Course {
  id: number;
  name: string;
  city: string;
  state: string;
  country: string;
}

export async function searchCourses(term: string): Promise<Course[]> {
  if (!term) return [];
  const url = `${BASE}/courses?search=${encodeURIComponent(term)}&limit=20`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": API_KEY!,
      // GolfBERT is signed with AWS SigV4; <signRequest> wraps that boiler-plate
      ...signRequest({ url, method: "GET", access: ACCESS!, secret: SECRET! }),
    },
  });
  if (!res.ok) throw new Error("GolfBERT search failed");
  return res.json(); // ≈ [{ id, name, … }]
}
