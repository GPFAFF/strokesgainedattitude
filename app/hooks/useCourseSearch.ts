import { useQuery } from "@tanstack/react-query";
import { getFunctions, httpsCallable } from "firebase/functions";

export const useCourseSearch = (search_query: string) => {
  const fn = httpsCallable(getFunctions(), "searchCourses");

  return useQuery({
    queryKey: ["courses", search_query],
    queryFn: () =>
      fn({ search_query }).then((r: any) => {
        console.log("🔍 Course search results:", r.data);
        return r.data;
      }),
    enabled: !!search_query,
    staleTime: 1000 * 60 * 60,
  });
};
