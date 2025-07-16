import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useMutation } from "@tanstack/react-query";
import { db } from "../firebase/config";
import { useSnackbar } from "../context/SnackbarContext";
import * as Crypto from "expo-crypto";

export type NewCourseInput = {
  name: string;
  city: string;
  state: string;
  tees: {
    course_rating: string;
    slope_rating: string;
    tee_name: string;
  }[];
  isCustom?: boolean;
  searchIndex?: string;
};

export function useSaveCustomCourse() {
  const showSnackbar = useSnackbar();

  return useMutation({
    mutationFn: async (input: NewCourseInput) => {
      const courseId = `custom-${await Crypto.randomUUID()}`;

      const newCourse = {
        name: input.name,
        club: input.name,
        city: input.city,
        state: input.state,
        tees: {
          male: input.tees,
          rating: input.tees[0].course_rating,
          slope: input.tees[0].slope_rating,
        },
        createdAt: serverTimestamp(),
        isCustom: true,
        searchIndex: input.name.toLowerCase(),
      };

      await setDoc(doc(db, "courses", courseId), newCourse);
      return { ...newCourse, id: courseId };
    },
    onSuccess: () => {
      showSnackbar("Course saved successfully!", "success");
    },
    onError: (error: any) => {
      console.error("Error saving course:", error);
      showSnackbar("Failed to save course. Please try again.", "error");
    },
  });
}
