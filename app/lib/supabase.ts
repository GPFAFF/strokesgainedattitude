import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";
import { AppState } from "react-native";

import type { Database } from "./database.types";

const { supabaseUrl, supabaseAnonKey } = (Constants.expoConfig?.extra ??
  {}) as {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase config. Set `supabaseUrl` and `supabaseAnonKey` under `expo.extra` in app.json."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persisting to AsyncStorage is what keeps a user signed in across app
    // restarts. Without it the session lives in memory only and every cold
    // start looks like a logged-out user.
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    // There is no URL to parse a session out of in a native app.
    detectSessionInUrl: false,
  },
});

// Refresh tokens only while the app is actually in the foreground.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
