import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MentalTrackerScreen from "../screens/MentalTrackerScreen";

import ProfileScreen from "../screens/ProfileScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import { Ionicons } from "@expo/vector-icons";
import RoundHistoryScreen from "../screens/RoundHistoryScreen";
import ChartScreen from "../screens/ChartScreen";

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
          } else if (route.name === "Charts") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
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
      <Tab.Screen name="Charts" component={ChartScreen} />
      <Tab.Screen name="History" component={RoundHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
