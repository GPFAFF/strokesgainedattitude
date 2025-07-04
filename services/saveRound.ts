// firebase/saveMentalRound.js
import { User } from "firebase/auth";
import { db, auth } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface MentalRoundScores {
  [key: string]: number;
}

export const saveMentalRound = async (
  user: User | null,
  scores: MentalRoundScores
): Promise<void> => {
  console.log("auth:", auth);

  console.log(
    "Saving mental round for user:",
    user?.uid,
    "with scores:",
    scores
  );

  if (!user) throw new Error("User not logged in");

  await addDoc(collection(db, "mentalRounds"), {
    uid: user.uid,
    scores,
    createdAt: serverTimestamp(),
  });
};
