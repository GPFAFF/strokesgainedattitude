import { useQuery } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";

export interface Score {
  category: string;
  averageScore: number;
  concepts: { concept: string; score: number }[];
}

/**
 * Category averages with their per-concept breakdown.
 *
 * These come from the user_category_stats / user_concept_stats views, which
 * replaced the aggregateMentalCategories Cloud Function. Nothing has to be kept
 * in sync on write, so the numbers can't drift from the underlying ratings.
 */
export const useMentalCategoryStats = (userId?: string) => {
  return useQuery<Score[]>({
    queryKey: ["mentalCategoryStats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [categories, conceptRows] = await Promise.all([
        supabase
          .from("user_category_stats")
          .select("category, average")
          .eq("user_id", userId!),
        supabase
          .from("user_concept_stats")
          .select("category, concept, average")
          .eq("user_id", userId!),
      ]);

      if (categories.error) throw categories.error;
      if (conceptRows.error) throw conceptRows.error;

      // View columns come back nullable (a Postgres view carries no NOT NULL),
      // so drop any row missing the fields we key on.
      const conceptsByCategory: Record<
        string,
        { concept: string; score: number }[]
      > = {};
      for (const row of conceptRows.data ?? []) {
        if (!row.category || !row.concept) continue;
        (conceptsByCategory[row.category] ??= []).push({
          concept: row.concept,
          score: Number(row.average ?? 0),
        });
      }

      return (categories.data ?? [])
        .filter((row): row is typeof row & { category: string } => !!row.category)
        .map((row) => ({
          category: row.category,
          averageScore: Number(row.average ?? 0),
          concepts: conceptsByCategory[row.category] ?? [],
        }));
    },
    staleTime: 1000 * 60 * 5,
  });
};
