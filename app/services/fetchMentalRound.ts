// firebase/fetchMentalRounds.js
import { User } from "firebase/auth";
import { db, auth } from "../firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

export const fetchMentalRounds = async (user: User) => {
  if (!user?.uid) return [];

  const q = query(collection(db, "mentalRounds"), where("uid", "==", user.uid));

  const snapshot = await getDocs(q);
  console.log("Fetched mental rounds:", snapshot.docs.length);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
