// hooks/useUserProfile.ts

import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export const useUserProfile = (uid?: string) => {
  return useQuery({
    queryKey: ["user", uid],
    enabled: !!uid,
    queryFn: async () => {
      const userRef = doc(db, "users", uid!);
      const snap = await getDoc(userRef);
      return snap.exists() ? snap.data() : {};
    },
    staleTime: 1000 * 60 * 5,
  });
};
