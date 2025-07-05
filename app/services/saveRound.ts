import { User } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db as firestore } from "../firebase/config";
import concepts from "../data/mentalConcepts.json"; // adjust if needed

interface MentalRoundScores {
  [key: string]: number;
}

export const saveMentalRound = async (
  user: User | null,
  scores: MentalRoundScores
): Promise<void> => {
  if (!user) throw new Error("User not logged in");

  try {
    const categoryMap: { [key: string]: number[] } = {};

    for (const { concept, category } of concepts) {
      if (scores[concept] !== undefined) {
        if (!categoryMap[category]) categoryMap[category] = [];
        categoryMap[category].push(scores[concept]);
      }
    }

    const categoryScores: { [key: string]: number } = {};
    for (const [category, values] of Object.entries(categoryMap)) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      categoryScores[category] = parseFloat(avg.toFixed(2));
    }

    await addDoc(collection(firestore, "mentalRounds"), {
      uid: user.uid,
      createdAt: serverTimestamp(),
      scores,
      categoryScores,
    });

    const docRef = await addDoc(collection(firestore, "mentalRounds"), {
      uid: user.uid,
      createdAt: serverTimestamp(),
      scores,
      categoryScores,
    });

    console.log("Mental round saved with ID:", docRef.id);
  } catch (error) {
    console.error("Error saving round:", error);
    throw error;
  }
};
