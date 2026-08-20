import "react-native-reanimated";

import React from "react";
import { ActivityIndicator, View } from "react-native";
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
import { useAuth } from "./hooks/auth";
import { colors } from "./theme";
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

/**
 * The root navigator renders the auth stack or the app tabs based on session
 * state rather than navigating between them. Signing in or out swaps the tree
 * on its own, so there is no navigate("App") call to forget — and a returning
 * user with a persisted session lands straight in the app.
 */
function RootNavigator() {
  const { session, authLoading } = useAuth();

  if (authLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <>
          <RootStack.Screen name="App" component={BottomTabs} />
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
        </>
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackScreen} />
      )}
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SnackbarProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </SnackbarProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
