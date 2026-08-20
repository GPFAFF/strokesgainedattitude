import { useQuery } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import { MentalRound } from "../lib/types";

export const fetchMentalRounds = async (
  userId: string
): Promise<MentalRound[]> => {
  // One query pulls each round with its concept ratings nested, replacing the
  // per-round fan-out the Firestore version needed.
  const { data, error } = await supabase
    .from("rounds")
    .select(
      `id, user_id, played_at, course_id, course_name, course_city,
       course_state, tee, round_score, putts, fairways_hit,
       greens_in_regulation, handicap_differential, created_at,
       round_scores ( concept, category, score )`
    )
    .eq("user_id", userId)
    .order("played_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const ratings = (row.round_scores ?? []) as {
      concept: string;
      category: string;
      score: number;
    }[];

    const scores: Record<string, number> = {};
    const byCategory: Record<string, number[]> = {};
    for (const r of ratings) {
      scores[r.concept] = r.score;
      (byCategory[r.category] ??= []).push(r.score);
    }

    const categoryScores: Record<string, number> = {};
    for (const [category, values] of Object.entries(byCategory)) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      categoryScores[category] = parseFloat(avg.toFixed(2));
    }

    return {
      id: row.id,
      uid: row.user_id,
      playedAt: row.played_at,
      scores,
      categoryScores,
      courseId: row.course_id ?? undefined,
      courseName: row.course_name ?? undefined,
      courseCity: row.course_city ?? undefined,
      courseState: row.course_state ?? undefined,
      tees: row.tee ?? undefined,
      roundScore: row.round_score ?? undefined,
      putts: row.putts ?? undefined,
      fairwaysHit: row.fairways_hit ?? undefined,
      greensInRegulation: row.greens_in_regulation ?? undefined,
      handicapDifferential: row.handicap_differential ?? undefined,
    } as MentalRound;
  });
};

export function useMentalRounds(userId?: string | null) {
  return useQuery<MentalRound[]>({
    queryKey: ["mentalRounds", userId],
    queryFn: () => fetchMentalRounds(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
