import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import { useSnackbar } from "../context/SnackbarContext";

export function useUpdateUserProfile() {
  const [updating, setUpdating] = useState(false);
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  const handleUpdateProfile = async ({
    displayName,
    handicap,
  }: {
    displayName: string;
    handicap: string;
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUpdating(true);
    try {
      const parsedHandicap = handicap.trim() === "" ? null : Number(handicap);
      if (parsedHandicap !== null && Number.isNaN(parsedHandicap)) {
        showSnackbar("Handicap must be a number", "error");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          handicap: parsedHandicap,
          profile_complete: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Keep the auth user's metadata in step so it is available on the session.
      await supabase.auth.updateUser({ data: { display_name: displayName } });

      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      showSnackbar("Profile updated successfully", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showSnackbar(`Error updating profile: ${message}`, "error");
    } finally {
      setUpdating(false);
    }
  };

  return { handleUpdateProfile, updating };
}
