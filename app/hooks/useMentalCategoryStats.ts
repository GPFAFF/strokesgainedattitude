import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

export interface Score {
  category: string;
  averageScore: number;
  concepts: { concept: string; score: number }[];
}

export const useMentalCategoryStats = (uid?: string) => {
  return useQuery<Score[]>({
    queryKey: ["mentalCategoryStats", uid],
    enabled: !!uid,
    queryFn: async () => {
      const snapshot = await getDocs(
        collection(db, "mentalCategoryStats", uid!, "categories")
      );

      if (snapshot.empty) return [];

      return snapshot.docs.map((doc) => {
        const data = doc.data();
        // Each concept entry is stored as { total, count, average }.
        const concepts = Object.entries(
          (data.concepts || {}) as Record<string, { average?: number }>
        ).map(([concept, stat]) => ({
          concept,
          score: Number(stat?.average ?? 0),
        }));

        return {
          category: doc.id,
          averageScore: data.average || 0,
          concepts,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
};
