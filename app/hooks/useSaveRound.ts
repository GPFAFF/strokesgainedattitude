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
import { Tee } from "../lib/types";

interface MentalRoundScores {
  [key: string]: number;
}

interface CourseInfo {
  courseId?: string;
  courseName?: string;
  courseCity?: string;
  courseState?: string;
  tees: Tee;
}

type SaveRoundPayload = {
  user: User;
  scores: MentalRoundScores;
  courseInfo?: CourseInfo;
  roundScore?: number;
  putts?: number;
  fairwaysHit?: number;
  greensInRegulation?: number;
};

function computeHandicapDifferential(
  score: number,
  tee: Tee
): number | undefined {
  const rating = parseFloat(String(tee.course_rating));
  const slope = parseFloat(String(tee.slope_rating));
  if (isNaN(rating) || isNaN(slope) || slope === 0) return undefined;
  return parseFloat(((score - rating) * 113 / slope).toFixed(1));
}

export const useSaveMentalRound = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      scores,
      courseInfo,
      roundScore,
      putts,
      fairwaysHit,
      greensInRegulation,
    }: SaveRoundPayload) => {
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

      const differential =
        roundScore && courseInfo?.tees
          ? computeHandicapDifferential(roundScore, courseInfo.tees)
          : undefined;

      const newRound = {
        uid: user.uid,
        createdAt: serverTimestamp(),
        scores,
        categoryScores,
        ...(courseInfo?.courseId && { courseId: courseInfo.courseId }),
        ...(courseInfo?.courseName && { courseName: courseInfo.courseName }),
        ...(courseInfo?.courseCity && { courseCity: courseInfo.courseCity }),
        ...(courseInfo?.courseState && { courseState: courseInfo.courseState }),
        tees: courseInfo?.tees,
        roundScore: roundScore ?? 0,
        ...(differential !== undefined && {
          handicapDifferential: differential,
        }),
        ...(putts !== undefined && { putts }),
        ...(fairwaysHit !== undefined && { fairwaysHit }),
        ...(greensInRegulation !== undefined && { greensInRegulation }),
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
      queryClient.invalidateQueries({
        queryKey: ["user", variables.user.uid],
      });
      queryClient.invalidateQueries({
        queryKey: ["mentalCategoryStats", variables.user.uid],
      });
      queryClient.invalidateQueries({
        queryKey: ["mentalRounds", variables.user.uid],
      });
    },
  });
};
