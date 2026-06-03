import { useQuery } from "@tanstack/react-query";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Course } from "../lib/types";

export const useCourseSearch = (search_query: string) => {
  const fn = httpsCallable<{ search_query: string }, Course[]>(
    getFunctions(),
    "searchCourses"
  );

  return useQuery<Course[]>({
    queryKey: ["courses", search_query],
    queryFn: () => fn({ search_query }).then((r) => r.data),
    enabled: !!search_query,
    staleTime: 1000 * 60 * 60,
  });
};
