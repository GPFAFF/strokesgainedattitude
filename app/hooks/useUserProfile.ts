import { useQuery } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import { UserProfile } from "../lib/types";

export const useUserProfile = (userId?: string) => {
  return useQuery<UserProfile | null>({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        email: data.email ?? undefined,
        displayName: data.display_name ?? undefined,
        handicap: data.handicap,
        profileComplete: data.profile_complete,
        createdAt: data.created_at,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

/** Round count, read straight from the rounds table. */
export const useRoundCount = (userId?: string) => {
  return useQuery<number>({
    queryKey: ["roundCount", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("rounds")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId!);

      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 1000 * 60 * 2,
  });
};
