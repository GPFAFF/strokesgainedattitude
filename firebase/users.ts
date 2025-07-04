import { db } from "./config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export const createUserDocument = async (uid: string, email: string) => {
  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    email,
    createdAt: serverTimestamp(),
    profileComplete: false,
    rounds: [], // optional: to reference saved round IDs
  });
};
