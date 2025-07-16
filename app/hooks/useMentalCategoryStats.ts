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
        return {
          category: doc.id,
          averageScore: data.average || 0,
          concepts: Object.entries(data.concepts || {}).map(
            ([concept, score]) => ({ concept, score: Number(score) })
          ),
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
};
