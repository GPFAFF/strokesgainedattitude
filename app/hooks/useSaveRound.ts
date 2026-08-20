import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import concepts from "../data/mentalConcepts.json";
import { Tee } from "../lib/types";

type Concept = { concept: string; category: string };

const CATEGORY_BY_CONCEPT: Record<string, string> = Object.fromEntries(
  (concepts as Concept[]).map((c) => [c.concept, c.category])
);

export interface SaveRoundCourseInfo {
  courseId?: string;
  courseName?: string;
  courseCity?: string;
  courseState?: string;
  /** The single tee box selected for this round. */
  tees: Tee;
}

type SaveRoundPayload = {
  userId: string;
  scores: Record<string, number>;
  courseInfo?: SaveRoundCourseInfo;
  roundScore?: number;
  putts?: number;
  fairwaysHit?: number;
  greensInRegulation?: number;
};

export const useSaveMentalRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      scores,
      courseInfo,
      roundScore,
      putts,
      fairwaysHit,
      greensInRegulation,
    }: SaveRoundPayload) => {
      // handicap_differential is a generated column — the database derives it
      // from round_score and the tee's rating/slope, so we never send it.
      const { data: round, error: roundError } = await supabase
        .from("rounds")
        .insert({
          user_id: userId,
          course_id: courseInfo?.courseId ?? null,
          course_name: courseInfo?.courseName ?? null,
          course_city: courseInfo?.courseCity ?? null,
          course_state: courseInfo?.courseState ?? null,
          tee: courseInfo?.tees ?? null,
          round_score: roundScore ?? null,
          putts: putts ?? null,
          fairways_hit: fairwaysHit ?? null,
          greens_in_regulation: greensInRegulation ?? null,
        })
        .select("id")
        .single();

      if (roundError) throw roundError;

      const rows = Object.entries(scores)
        // Drop anything not in the concept list rather than writing a row with
        // no category, which would skew the stats views.
        .filter(([concept]) => CATEGORY_BY_CONCEPT[concept])
        .map(([concept, score]) => ({
          round_id: round.id,
          concept,
          category: CATEGORY_BY_CONCEPT[concept],
          score,
        }));

      if (rows.length) {
        const { error: scoresError } = await supabase
          .from("round_scores")
          .insert(rows);

        if (scoresError) {
          // Don't leave a round with no ratings behind.
          await supabase.from("rounds").delete().eq("id", round.id);
          throw scoresError;
        }
      }

      return round.id;
    },

    onSuccess: (_data, variables) => {
      for (const key of [
        ["profile", variables.userId],
        ["mentalRounds", variables.userId],
        ["mentalCategoryStats", variables.userId],
      ]) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    },
  });
};
