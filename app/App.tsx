import "react-native-reanimated";

import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";

import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import SelectCourseScreen from "./screens/SelectCourseScreen";
import AddCourseScreen from "./screens/AddCourseScreen";

import BottomTabs from "./navigation/tabs";
import { SnackbarProvider } from "./context/SnackbarContext";
import { queryClient } from "./lib/queryClient";
import { RootStackParamList } from "./lib/types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <NavigationContainer>
              <RootStack.Navigator screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="Auth" component={AuthStackScreen} />
                <RootStack.Screen name="App" component={BottomTabs} />

                {/* Modals presented over whichever stack is active */}
                <RootStack.Group screenOptions={{ presentation: "modal" }}>
                  <RootStack.Screen
                    name="SelectCourse"
                    component={SelectCourseScreen}
                    options={{ animation: "slide_from_bottom" }}
                  />
                  <RootStack.Screen
                    name="AddCourse"
                    component={AddCourseScreen}
                    options={{ animation: "slide_from_bottom" }}
                  />
                </RootStack.Group>
              </RootStack.Navigator>
            </NavigationContainer>
          </SnackbarProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
