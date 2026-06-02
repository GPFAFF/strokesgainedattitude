import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { User } from "firebase/auth";
import { MentalRound } from "../lib/types";

export const fetchMentalRounds = async (
  uid: string
): Promise<MentalRound[]> => {
  const q = query(collection(db, "mentalRounds"), where("uid", "==", uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as MentalRound)
  );
};

export function useMentalRounds(user?: User | null) {
  return useQuery<MentalRound[]>({
    queryKey: ["mentalRounds", user?.uid],
    queryFn: () => {
      if (!user?.uid) return Promise.resolve([]);
      return fetchMentalRounds(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 1000 * 60 * 2,
  });
}
