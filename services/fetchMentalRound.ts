// firebase/fetchMentalRounds.js
import { db, auth } from "../firebase/config";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import useAuth from "../hooks/auth";
import { User } from "firebase/auth";

export const fetchMentalRounds = async (user: User | null) => {
  if (!user) throw new Error("User not logged in");

  const q = query(
    collection(db, "mentalRounds"),
    where("uid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
