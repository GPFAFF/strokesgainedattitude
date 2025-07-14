// hooks/useSaveMentalRound.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  doc,
} from "firebase/firestore";
import { db as firestore } from "../firebase/config";
import concepts from "../data/mentalConcepts.json";

interface MentalRoundScores {
  [key: string]: number;
}

interface CourseInfo {
  courseId?: string;
  courseName?: string;
  courseCity?: string;
  courseState?: string;
}

type SaveRoundPayload = {
  user: User;
  scores: MentalRoundScores;
  courseInfo?: CourseInfo;
};

export const useSaveMentalRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, scores, courseInfo }: SaveRoundPayload) => {
      const categoryMap: { [key: string]: number[] } = {};

      for (const entry of concepts) {
        const concept = entry?.concept;
        const category = entry?.category;
        if (concept && category && scores[concept] !== undefined) {
          if (!categoryMap[category]) categoryMap[category] = [];
          categoryMap[category].push(scores[concept]);
        }
      }

      const categoryScores: { [key: string]: number } = {};
      for (const [category, values] of Object.entries(categoryMap)) {
        if (Array.isArray(values) && values.length > 0) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          categoryScores[category] = parseFloat(avg.toFixed(2));
        }
      }

      const newRound = {
        uid: user.uid,
        createdAt: serverTimestamp(),
        scores,
        categoryScores,
        ...courseInfo,
      };

      const docRef = await addDoc(
        collection(firestore, "mentalRounds"),
        newRound
      );

      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        rounds: arrayUnion(docRef.id),
      });

      return docRef.id;
    },

    onSuccess: (_data, variables) => {
      // invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["mentalRounds", variables.user.uid],
      });
      queryClient.invalidateQueries({
        queryKey: ["mentalCategoryStats", variables.user.uid],
      });
      queryClient.invalidateQueries({ queryKey: ["user", variables.user.uid] });
    },
  });
};
