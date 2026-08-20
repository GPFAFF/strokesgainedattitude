import { useQuery } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import { Course } from "../lib/types";

type EdgeCourse = {
  id: string;
  name: string;
  club?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  tees?: Course["tees"];
  is_custom?: boolean;
};

export const useCourseSearch = (search_query: string) => {
  return useQuery<Course[]>({
    queryKey: ["courses", search_query],
    enabled: !!search_query,
    staleTime: 1000 * 60 * 60,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<EdgeCourse[]>(
        "search-courses",
        { body: { search_query } }
      );

      if (error) throw error;

      return (data ?? []).map((c) => ({
        id: c.id,
        name: c.name ?? "",
        club: c.club ?? undefined,
        city: c.city ?? undefined,
        state: c.state ?? undefined,
        country: c.country ?? undefined,
        tees: c.tees,
        isCustom: c.is_custom ?? false,
      }));
    },
  });
};
