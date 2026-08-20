import { useCallback, useEffect, useState } from "react";
import * as Linking from "expo-linking";

import { supabase } from "../lib/supabase";

/**
 * Detects that the app was opened from a Supabase password-recovery link and
 * exchanges it for a session.
 *
 * The client is created with `detectSessionInUrl: false` (there is no browser
 * URL in a native app), so the tokens have to be pulled off the deep link and
 * handed to setSession here. Supabase returns them in the URL *fragment*.
 */
export function usePasswordRecovery() {
  const [recovering, setRecovering] = useState(false);

  const handleUrl = useCallback(async (url: string | null) => {
    if (!url) return;

    // Tokens arrive after '#', which Linking.parse() does not read.
    const fragment = url.split("#")[1];
    if (!fragment) return;

    const params = new URLSearchParams(fragment);
    if (params.get("type") !== "recovery") return;

    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;

    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (!error) setRecovering(true);
  }, []);

  useEffect(() => {
    // Cold start: the link that launched the app.
    Linking.getInitialURL().then(handleUrl);

    // Warm start: the app was already running.
    const sub = Linking.addEventListener("url", ({ url }) => handleUrl(url));

    // Supabase also emits this when it recognises a recovery session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
    });

    return () => {
      sub.remove();
      subscription.unsubscribe();
    };
  }, [handleUrl]);

  const finishRecovery = useCallback(() => setRecovering(false), []);

  return { recovering, finishRecovery };
}
