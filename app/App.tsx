import "react-native-reanimated";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text } from "react-native";

import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import MentalTrackerScreen from "./screens/MentalTrackerScreen";
import DataVisualizationScreen from "./screens/DataVisualizationScreen";
import RoundHistoryScreen from "./screens/RoundHistoryScreen";
import ChartScreen from "./screens/ChartScreen";
import AdminDashboardScreen from "./screens/AdminDashboardScreen";
import { auth } from "./firebase/config";
import useAuth from "./hooks/auth";
import BottomTabs from "./navigation/tabs";
import { SnackbarProvider } from "./hooks/useSnackbar";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createNativeStackNavigator<RootStackParamList>();

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  MentalTracker: undefined;
  DataVisualization: undefined;
  RoundHistory: undefined;
  ChartScreen: undefined;
  AdminDashboard: undefined;
};

function ProtectedAdminScreen() {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <ActivityIndicator />;
  }

  if (!user) {
    return <Text style={{ margin: 20 }}>Unauthorized - Admins Only</Text>;
  }
  return <AdminDashboardScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SnackbarProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Onboarding">
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen
              name="MentalTracker"
              component={MentalTrackerScreen}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen as React.ComponentType}
            />
            <Stack.Screen
              name="DataVisualization"
              component={DataVisualizationScreen}
            />
            <Stack.Screen name="RoundHistory" component={RoundHistoryScreen} />
            <Stack.Screen name="ChartScreen" component={ChartScreen} />
            <Stack.Screen
              name="AdminDashboard"
              component={BottomTabs}
              options={{
                headerShown: false, // Hide the header for the admin dashboard
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SnackbarProvider>
    </SafeAreaProvider>
  );
}
