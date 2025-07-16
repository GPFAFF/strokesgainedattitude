interface Course {
  id: string;
  name: string;
  location?: string;
  rating?: number;
  // Add more as needed
}

interface Tee {
  id: string;
  color: string;
  slope?: number;
  rating?: number;
}

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  MentalTracker: undefined;
  DataVisualization: undefined;
  RoundHistory: undefined;
  ChartScreen: undefined;
  AdminDashboard: undefined;
  AddCourse: undefined;
  SelectCourse: {
    onSelect: (payload: { course: Course; tee: Tee }) => void;
    onAddCourse?: (query: string) => void;
  };
};
export type { Course, Tee, RootStackParamList };
