import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import MentalTrackerScreen from "../screens/MentalTrackerScreen";
import InsightScreen from "../screens/InsightScreen";
import RoundHistoryScreen from "../screens/RoundHistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#1B4332",
        tabBarInactiveTintColor: "#ccc",
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "help";
          if (route.name === "Dashboard") {
            iconName = focused ? "golf" : "golf-outline";
          } else if (route.name === "Track") {
            iconName = focused ? "pulse" : "pulse-outline";
          } else if (route.name === "Insights") {
            iconName = focused ? "trending-up" : "trending-up-outline";
          } else if (route.name === "History") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Track" component={MentalTrackerScreen} />
      <Tab.Screen name="Insights" component={InsightScreen} />
      <Tab.Screen name="History" component={RoundHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
