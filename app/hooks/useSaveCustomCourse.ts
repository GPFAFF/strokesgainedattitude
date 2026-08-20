import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "../lib/supabase";
import { useSnackbar } from "../context/SnackbarContext";
import { Course, Tee } from "../lib/types";

export type NewCourseInput = {
  name: string;
  city: string;
  state: string;
  tees: Tee[];
};

export function useSaveCustomCourse() {
  const showSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewCourseInput): Promise<Course> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to add a course.");

      // id is left to the database default ('custom-' || uuid). created_by and
      // is_custom are required by the RLS insert policy.
      const { data, error } = await supabase
        .from("courses")
        .insert({
          name: input.name,
          club: input.name,
          city: input.city,
          state: input.state,
          tees: { male: input.tees },
          is_custom: true,
          created_by: user.id,
          search_index: [input.name, input.city, input.state]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        })
        .select("*")
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        club: data.club ?? undefined,
        city: data.city ?? undefined,
        state: data.state ?? undefined,
        tees: data.tees as Course["tees"],
        isCustom: true,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      showSnackbar("Course saved successfully!", "success");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unknown error saving course";
      showSnackbar(`Error saving course: ${message}`, "error");
    },
  });
}
