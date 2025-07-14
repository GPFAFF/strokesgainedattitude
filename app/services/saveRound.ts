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

export const saveMentalRound = async (
  user: User | null,
  scores: MentalRoundScores,
  courseInfo?: CourseInfo
): Promise<void> => {
  if (!user || !user.uid) {
    console.error("❌ No valid user provided");
    throw new Error("User not logged in");
  }

  try {
    const categoryMap: { [key: string]: number[] } = {};

    // Defensive check for concepts
    if (!Array.isArray(concepts)) {
      throw new Error("Concepts is not an array");
    }

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
      if (!Array.isArray(values) || values.length === 0) continue;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      categoryScores[category] = parseFloat(avg.toFixed(2));
    }

    const newRound = {
      uid: user.uid,
      createdAt: serverTimestamp(),
      scores,
      categoryScores,
      ...courseInfo,
    };

    console.log("🧠 Saving mental round:", newRound);

    const docRef = await addDoc(
      collection(firestore, "mentalRounds"),
      newRound
    );
    console.log("✅ Mental round saved with ID:", docRef.id);

    // Attach the round to the user's rounds array
    const userRef = doc(firestore, "users", user.uid);
    await updateDoc(userRef, {
      rounds: arrayUnion(docRef.id),
    });

    console.log("✅ Round ID added to user:", user.uid);
  } catch (error) {
    console.error("❌ Error saving mental round:", error);
    throw error;
  }
};
