import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// --- Add your custom types ---
export type FirestoreUserProfile = {
  handicap?: string;
  avatarUrl?: string;
  theme?: "light" | "dark";
  [key: string]: any;
};

export type AppUser = FirebaseUser & FirestoreUserProfile;

export default function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const profile = userSnap.exists() ? userSnap.data() : {};

          setUser({ ...firebaseUser, ...profile });
        } catch (err) {
          console.error("Failed to load Firestore user profile:", err);
          setUser(firebaseUser as AppUser); // fallback to auth-only
        }
      } else {
        setUser(null);
      }

      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, authLoading };
}
