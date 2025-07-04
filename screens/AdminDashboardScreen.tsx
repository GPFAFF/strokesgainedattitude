import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Logo from "../components/logo";

type RootStackParamList = {
  MentalTracker: undefined;
  AdminDashboard: undefined; // Add MentalTracker to the stack
  DataVisualization: undefined;
  ChartScreen: undefined;
};

export default function AdminDashboardScreen() {
  const navigation = useNavigation() as NavigationProp<RootStackParamList>;

  return (
    <View style={styles.container}>
      <Logo />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MentalTracker")}
      >
        <Text style={styles.buttonText}>Add Mental Round</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("DataVisualization")}
      >
        <Text style={styles.buttonText}>View Mental Trends</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ChartScreen")}
      >
        <Text style={styles.buttonText}>Detailed Score Breakdown</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 32,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#1B4332",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
