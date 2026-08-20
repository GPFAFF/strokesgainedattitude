import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import QuickLogScreen from "../screens/QuickLogScreen";
import InsightScreen from "../screens/InsightScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

const ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Home: ["golf", "golf-outline"],
  Log: ["add-circle", "add-circle-outline"],
  Insights: ["trending-up", "trending-up-outline"],
  Profile: ["person", "person-outline"],
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const pair = ICONS[route.name];
          const name = pair ? (focused ? pair[0] : pair[1]) : "help";
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={AdminDashboardScreen} />
      <Tab.Screen name="Log" component={QuickLogScreen} />
      <Tab.Screen name="Insights" component={InsightScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
