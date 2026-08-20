import { useState } from "react";

import { supabase } from "../lib/supabase";
import { useSnackbar } from "../context/SnackbarContext";

/**
 * Deletes the signed-in user's data, then signs them out.
 *
 * Removing the auth user itself needs the service role, so that half belongs in
 * an edge function (`delete-account`) rather than the client. Until that is
 * deployed this clears every row the user owns — rounds cascade to
 * round_scores, and custom courses are released — which is the part that
 * actually matters for a data-deletion request. Signing out afterwards returns
 * the app to the auth stack.
 */
export function useDeleteAccount() {
  const [deleting, setDeleting] = useState(false);
  const showSnackbar = useSnackbar();

  const deleteAccount = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      showSnackbar("You are not signed in.", "error");
      return;
    }

    setDeleting(true);
    try {
      // round_scores cascade from rounds, so deleting rounds is enough.
      const { error: roundsError } = await supabase
        .from("rounds")
        .delete()
        .eq("user_id", user.id);
      if (roundsError) throw roundsError;

      const { error: coursesError } = await supabase
        .from("courses")
        .delete()
        .eq("created_by", user.id)
        .eq("is_custom", true);
      if (coursesError) throw coursesError;

      const { error: fnError } = await supabase.functions.invoke(
        "delete-account"
      );
      if (fnError) {
        // The data is already gone; surface it but still sign out.
        console.warn("delete-account function unavailable:", fnError.message);
      }

      await supabase.auth.signOut();
      showSnackbar("Your account data has been deleted.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showSnackbar(`Could not delete account: ${message}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  return { deleteAccount, deleting };
}
