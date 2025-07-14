// hooks/useUpdateUserProfile.ts
import { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/config"; // update path if needed
import { useSnackbar } from "../context/SnackbarContext"; // or however you show toasts

export function useUpdateUserProfile() {
  const [updating, setUpdating] = useState(false);
  const showSnackbar = useSnackbar();

  const handleUpdateProfile = async ({
    displayName,
    handicap,
  }: {
    displayName: string;
    handicap: string;
  }) => {
    const auth = getAuth();
    const authUser = auth.currentUser;
    if (!authUser) return;

    setUpdating(true);
    try {
      await updateProfile(authUser, { displayName });

      await setDoc(
        doc(db, "users", authUser.uid),
        {
          handicap: handicap ? Number(handicap) : null,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

      showSnackbar("Profile updated successfully", "success");
    } catch (err) {
      console.error("Profile update error:", err);
      showSnackbar("An error occurred while updating the profile.", "error");
    } finally {
      setUpdating(false);
    }
  };

  return {
    handleUpdateProfile,
    updating,
  };
}
