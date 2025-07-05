import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/config";

import useAuth from "../hooks/auth";
import MentalScoreCarouselWithDetails from "../components/MentalScoreCarousel";
import { ActivityIndicator } from "react-native-paper";
import ScreenWrapper from "../components/ScreenWrapper";

type RootStackParamList = {
  MentalTracker: undefined;
  AdminDashboard: undefined; // Add MentalTracker to the stack
  DataVisualization: undefined;
  ChartScreen: undefined;
};

export default function AdminDashboardScreen() {
  const navigation = useNavigation() as NavigationProp<RootStackParamList>;

  const { user } = useAuth(); // Assuming useAuth is a custom hook that provides user info

  const [loading, setLoading] = useState(true);
  type Score = {
    category: string;
    averageScore: number;
    concepts: { concept: string; score: number }[];
  };

  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const loadStats = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(
          collection(db, "mentalCategoryStats", user.uid, "categories")
        );

        console.log("Fetched stats:", snapshot.docs);
        if (snapshot.empty) {
          console.log("No stats found for this user.");
          setScores([]);
          return;
        }
        console.log("Stats snapshot:", snapshot);
        // Transform the snapshot data into the desired format
        const results = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            category: doc.id,
            averageScore: data.average || 0,
            concepts: Object.entries(data.concepts || {}).map(
              ([concept, score]) => ({ concept, score })
            ),
          };
        });

        setScores(results);
      } catch (e) {
        console.error("Error fetching stats:", e);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B4332" />
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>
          Welcome, {user?.displayName || "Admin"}!
        </Text>
        <Image
          source={require("../assets/logo.png")} // Adjust the path as needed
          style={{
            width: 150,
            height: 150,
            alignSelf: "center",
            borderRadius: 8,
            // position: "absolute",
            // top: 50,
            // left: 20,
          }}
        />

        <Text style={styles.title}>Your Mental Performance Trends</Text>
        <Text style={{ textAlign: "left", marginBottom: 20 }}>
          You have logged {scores.length} rounds of mental performance.
        </Text>
        <Text style={{ textAlign: "left", marginBottom: 20 }}>
          Here are your average scores by category:
        </Text>
        <MentalScoreCarouselWithDetails scores={scores} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("MentalTracker")}
        >
          <Text style={styles.buttonText}>Add Mental Round</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
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
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginVertical: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
