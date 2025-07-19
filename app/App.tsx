import "react-native-reanimated";

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import MentalTrackerScreen from "./screens/MentalTrackerScreen";
import DataVisualizationScreen from "./screens/DataVisualizationScreen";
import RoundHistoryScreen from "./screens/RoundHistoryScreen";
import ChartScreen from "./screens/ChartScreen";

import BottomTabs from "./navigation/tabs";
import { SnackbarProvider } from "./context/SnackbarContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AddCourseScreen from "./screens/AddCourseScreen";
import { colors } from "./theme";
import SelectCourseScreen from "./screens/SelectCourseScreen";
import { RootStackParamList } from "./lib/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function MainStackScreen() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.warmTaupe,
        },
        headerTintColor: colors.charcoal,
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerTitleAlign: "center",
      }}
      initialRouteName="Onboarding"
    >
      <MainStack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen name="MentalTracker" component={MentalTrackerScreen} />
      <MainStack.Screen
        name="DataVisualization"
        component={DataVisualizationScreen}
      />
      <MainStack.Screen name="RoundHistory" component={RoundHistoryScreen} />
      <MainStack.Screen name="ChartScreen" component={ChartScreen} />
      <MainStack.Screen
        name="AdminDashboard"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
    </MainStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider>
          <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
              {/* Main app */}
              <RootStack.Screen name="Main" component={MainStackScreen} />

              {/* Modal screens */}
              <RootStack.Screen
                name="SelectCourse"
                component={SelectCourseScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
              <Stack.Screen
                name="AddCourse"
                component={AddCourseScreen}
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </RootStack.Navigator>
          </NavigationContainer>
        </SnackbarProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
