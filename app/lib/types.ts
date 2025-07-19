type Course = {
  id: string;
  name: string;
  location?: string;
  rating?: number;
};

type Tee = {
  id: string;
  color: string;
  slope?: number;
  rating?: number;
};

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  MentalTracker: undefined;
  DataVisualization: undefined;
  RoundHistory: undefined;
  ChartScreen: undefined;
  AdminDashboard: { screen: string };
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
  Tee,
  RootStackParamList,
  CourseInfo,
  MentalRoundScores,
  AddCourseScreenRouteParams,
};
