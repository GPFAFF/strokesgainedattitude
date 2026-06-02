import type { Timestamp } from "firebase/firestore";

// A single tee box as returned by the GolfCourse API / stored in Firestore.
// The upstream API uses string ratings, so we keep them permissive.
type Tee = {
  tee_name: string;
  course_rating?: number | string;
  slope_rating?: number | string;
  par_total?: number | string;
  total_yards?: number | string;
  number_of_holes?: number;
};

// Tees are grouped by gender in the GolfCourse API response.
type CourseTees = {
  male?: Tee[];
  female?: Tee[];
};

type Course = {
  id: string;
  name: string;
  club?: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lng?: number;
  searchIndex?: string;
  tees?: CourseTees;
  isCustom?: boolean;
};

// A saved mental-tracking round (Firestore `mentalRounds` document).
type MentalRound = {
  id: string;
  uid: string;
  createdAt?: Timestamp;
  scores: Record<string, number>;
  categoryScores?: Record<string, number>;
  courseId?: string;
  courseName?: string;
  courseCity?: string;
  courseState?: string;
  // Stored as the single selected tee box for the round.
  tees?: Tee;
  roundScore?: number;
};

// Firestore `users/{uid}` document.
type UserProfile = {
  email?: string;
  createdAt?: Timestamp;
  profileComplete?: boolean;
  rounds?: string[];
  handicap?: number | null;
  [key: string]: unknown;
};

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  MentalTracker: undefined;
  DataVisualization: undefined;
  RoundHistory: undefined;
  ChartScreen: undefined;
  AdminDashboard: { screen: string } | undefined;
  SelectCourse: {
    onSelect: (payload: { course: Course; tee: Tee }) => void;
    onAddCourse?: (query: string) => void;
  };
  AddCourse: {
    defaultName?: string;
    onSelect?: (data: { course: Course; tee: Tee }) => void;
  };
};

type MentalRoundScores = {
  [key: string]: number;
};

type CourseInfo = {
  courseId?: string;
  courseName?: string;
  courseCity?: string;
  courseState?: string;
};

type AddCourseScreenRouteParams = {
  defaultName?: string;
  onSelect?: (course: Course) => void;
};

export type {
  Course,
  CourseTees,
  Tee,
  MentalRound,
  UserProfile,
  RootStackParamList,
  CourseInfo,
  MentalRoundScores,
  AddCourseScreenRouteParams,
};
