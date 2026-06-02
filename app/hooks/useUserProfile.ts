import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { UserProfile } from "../lib/types";

export const useUserProfile = (uid?: string) => {
  return useQuery<UserProfile>({
    queryKey: ["user", uid],
    enabled: !!uid,
    queryFn: async () => {
      const userRef = doc(db, "users", uid!);
      const snap = await getDoc(userRef);
      return snap.exists() ? (snap.data() as UserProfile) : {};
    },
    staleTime: 1000 * 60 * 5,
  });
};
