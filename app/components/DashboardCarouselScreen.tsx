import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase/config";
import useAuth from "../hooks/auth";
import MentalScoreCarouselWithDetails from "./MentalScoreCarouselWithDetails"; // your carousel

const DashboardCarouselScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;

    const loadStats = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(
          collection(db, "mentalCategoryStats", user.uid, "categories")
        );

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
    <View style={styles.container}>
      <Text style={styles.title}>Your Mental Performance Trends</Text>
      <MentalScoreCarouselWithDetails scores={scores} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 16 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1B4332",
    marginVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DashboardCarouselScreen;
