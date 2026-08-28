import { useState } from "react";

import { supabase } from "../lib/supabase";
import { useSnackbar } from "../context/SnackbarContext";

/**
 * Permanently deletes the signed-in user's account.
 *
 * Supabase has no client API for deleting your own auth user, so this calls the
 * delete_current_user() function in the schema — SECURITY DEFINER, scoped to
 * auth.uid(), so it can only ever delete the caller. Profiles, rounds and
 * round_scores cascade from auth.users, and custom courses have their
 * created_by link cleared, so the single call removes everything.
 *
 * Signing out afterwards clears the local session, which returns the app to the
 * auth stack on its own.
 */
export function useDeleteAccount() {
  const [deleting, setDeleting] = useState(false);
  const showSnackbar = useSnackbar();

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_current_user");
      if (error) throw error;

      // The user no longer exists, so a failure here leaves only a stale local
      // session — not worth surfacing as a failed deletion.
      await supabase.auth.signOut().catch(() => {});

      showSnackbar("Your account has been deleted.", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showSnackbar(`Could not delete account: ${message}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  return { deleteAccount, deleting };
}
