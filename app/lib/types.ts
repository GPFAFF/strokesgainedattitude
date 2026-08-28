// A single tee box as returned by the GolfCourse API and stored on the round.
// The upstream API sends ratings as strings, so we keep them permissive.
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

// A saved round, flattened from public.rounds + its public.round_scores rows.
type MentalRound = {
  id: string;
  uid: string;
  /** ISO timestamp from public.rounds.played_at. */
  playedAt?: string;
  scores: Record<string, number>;
  categoryScores?: Record<string, number>;
  courseId?: string;
  courseName?: string;
  courseCity?: string;
  courseState?: string;
  // Stored as the single selected tee box for the round.
  tees?: Tee;
  roundScore?: number;
  // (Score - Course Rating) × 113 / Slope. Lower = better. Computed by the
  // database as a generated column, so it can never drift from its inputs.
  handicapDifferential?: number;
  // Optional shot-category stats for future SG correlations.
  putts?: number;
  fairwaysHit?: number;
  greensInRegulation?: number;
};

// public.profiles row.
type UserProfile = {
  id: string;
  email?: string;
  displayName?: string;
  handicap?: number | null;
  profileComplete?: boolean;
  createdAt?: string;
};

type RootStackParamList = {
  // Auth stack
  Auth: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;

  // App tabs
  App: undefined;
  Home: undefined;
  Log: undefined;
  Insights: undefined;
  Profile: undefined;

  // Root modals
  SelectCourse: {
    onSelect: (payload: { course: Course; tee: Tee }) => void;
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

export type {
  Course,
  CourseTees,
  Tee,
  MentalRound,
  UserProfile,
  RootStackParamList,
  CourseInfo,
  MentalRoundScores,
};
