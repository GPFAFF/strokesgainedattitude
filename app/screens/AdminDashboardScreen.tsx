import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/config";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import useAuth from "../hooks/auth";
import MentalScoreCarouselWithDetails from "../components/MentalScoreCarousel";
import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";

type RootStackParamList = {
  MentalTracker: undefined;
  AdminDashboard: undefined;
  DataVisualization: undefined;
  ChartScreen: undefined;
};

export default function AdminDashboardScreen() {
  const navigation = useNavigation() as NavigationProp<RootStackParamList>;

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  type Score = {
    category: string;
    averageScore: number;
    concepts: { concept: string; score: number }[];
  };

  const [scores, setScores] = useState<Score[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    if (!user?.uid) return;

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
            ([concept, score]) => ({ concept, score: Number(score) })
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

  useEffect(() => {
    loadStats();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#1B4332" />
          <Text style={styles.loadingText}>Loading charts...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title={`Welcome, ${user?.displayName || "Admin"}`} />
      <View style={styles.container}>
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
          <Text style={styles.buttonText}>Add Round</Text>
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
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2D6A4F",
  },
});
