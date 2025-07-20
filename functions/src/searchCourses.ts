import * as functions from "firebase-functions/v1";
import { admin } from "./initFirebase";
import fetch from "node-fetch";

const API_KEY =
  functions.config().golf?.api_key || process.env.GOLF_COURSE_API_KEY;
if (!API_KEY) throw new Error("Missing GolfCourse API key");

const db = admin.firestore();
const BASE = "https://api.golfcourseapi.com/v1";
const MAX_RESULTS = 25;

/**
 * Makes an authorized request to the GolfCourseAPI.
 * @param {string} path - API path to request
 * (e.g., "/search?search_query=pinehurst")
 * @return {Promise<Response>} - The fetch response
 */
const api = (path: string) =>
  fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Key ${API_KEY}`,
      Accept: "application/json",
    },
  });

/**
 * Performs a course search using the GolfCourseAPI.
 * @param {string} query - The full search string (e.g., "pinehurst nc")
 * @return {Promise<any[]>} - Array of course objects from API
 */
async function searchCoursesAPI(query: string): Promise<any[]> {
  const qs = new URLSearchParams({ search_query: query });
  const res = await api(`/search?${qs.toString()}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Search ${res.status}: ${text}`);
  }
  const body = await res.json();
  functions.logger.debug("Golf API response body:", body);

  if (!Array.isArray(body.courses)) {
    throw new Error("Golf API response does not contain 'courses' array");
  }

  return body.courses;
}

/**
 * Cloud Function: searchCourses
 * Searches for golf courses by a user-provided string (name, city, etc.).
 * Caches results in Firestore under `/courses/{id}` for future reuse.
 * Ensures deduplication and marks API courses with `isCustom: false`
 * Prioritizes custom user-added courses when duplicates are found.
 * @param {object} data - Callable function data
 * @param {string} data.search_query - User-entered text for course search
 * @returns {Promise<object[]>} - List of course objects
 */
export const searchCourses = functions
  .region("us-central1")
  .https.onCall(async (data) => {
    const searchQuery = data?.search_query?.trim();
    if (!searchQuery) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "`search_query` is required"
      );
    }

    functions.logger.debug("Golf course search:", searchQuery);

    const lowerQuery = searchQuery.toLowerCase();

    const snap = await db
      .collection("courses")
      .where("searchIndex", ">=", lowerQuery)
      .where("searchIndex", "<=", lowerQuery + "\uf8ff")
      .limit(MAX_RESULTS)
      .get();

    const firestoreCourses = snap.docs.map((doc) => doc.data());
    let combinedCourses = firestoreCourses;

    if (firestoreCourses.length < MAX_RESULTS) {
      try {
        const apiResults = await searchCoursesAPI(searchQuery);
        const limited = apiResults.slice(
          0,
          MAX_RESULTS - firestoreCourses.length
        );

        const apiCourses = limited
          .filter(
            (course) =>
              course.tees &&
              typeof course.tees === "object" &&
              Object.keys(course.tees).length > 0
          )
          .map((course) => ({
            id: `api-${course.id}`,
            name: course.course_name || "",
            club: course.club_name || "",
            city: course.location?.city || "",
            state: course.location?.state || "",
            country: course.location?.country || "",
            ...(course.location?.latitude !== undefined && {
              lat: course.location.latitude,
            }),
            ...(course.location?.longitude !== undefined && {
              lng: course.location.longitude,
            }),
            searchIndex: [
              course.course_name,
              course.club_name,
              course.location?.city,
              course.location?.state,
              course.location?.country,
            ]
              .filter(Boolean) // remove undefined/null
              .map((s) => s.toLowerCase())
              .join(" "),
            tees: course.tees,
            isCustom: false,
          }));

        const batch = db.batch();
        apiCourses.forEach((c) => {
          batch.set(
            db.collection("courses").doc(c.id),
            {
              ...c,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
        });
        await batch.commit();

        const deduped = new Map();
        for (const course of [...apiCourses, ...firestoreCourses]) {
          const key = `${course.name}-${course.city}-${course.state}`;
          if (!deduped.has(key)) {
            deduped.set(key, course);
          } else {
            const existing = deduped.get(key);
            if (existing.isCustom === false && course.isCustom === true) {
              deduped.set(key, course);
            }
          }
        }

        combinedCourses = Array.from(deduped.values());
      } catch (e) {
        functions.logger.error("Error fetching from API:", e);
      }
    }

    return combinedCourses;
  });
