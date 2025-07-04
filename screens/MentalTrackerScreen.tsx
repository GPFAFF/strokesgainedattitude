import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import Slider from "@react-native-community/slider";
import mentalConcepts from "../data/mentalConcepts.json";
import { saveMentalRound } from "../services/saveRound";
import useAuth from "../hooks/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  MentalTracker: undefined;
  AdminDashboard: undefined; // Add MentalTracker to the stack
};

type MentalTrackerScreen = NativeStackScreenProps<
  RootStackParamList,
  "MentalTracker"
>;

const MentalTrackerScreen = ({ navigation }: MentalTrackerScreen) => {
  const { user, authLoading } = useAuth();
  const [trackableConcepts, setTrackableConcepts] = useState<
    { concept: string; category: string; trackable: boolean }[]
  >([]);
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  console.log("User in MentalTrackerScreen:", user);

  useEffect(() => {
    const filtered = mentalConcepts.filter((c) => c.trackable);
    setTrackableConcepts(filtered);

    const defaultScores: { [key: string]: number } = {};

    filtered.forEach((c) => {
      defaultScores[c.concept] = 3;
    });
    setScores(defaultScores);
  }, []);

  // ✅ Return early after all hooks are declared
  if (authLoading) return <ActivityIndicator size="large" color="#1B4332" />;
  if (!user) return <Text>Please log in</Text>;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log("Submitted Mental Scores:", scores);
      await saveMentalRound(user, scores);
      navigation.navigate("AdminDashboard"); // Navigate to Admin Dashboard after saving
    } catch (error) {
      console.error("Error saving round:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mental Round Tracker</Text>

      {trackableConcepts.map(({ concept, category }) => (
        <View key={concept} style={styles.sliderContainer}>
          <Text style={styles.categoryLabel}>
            {concept} ({category}): {scores[concept]}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={scores[concept]}
            onValueChange={(value) =>
              setScores((prev) => ({ ...prev, [concept]: value }))
            }
            minimumTrackTintColor="#1B4332"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#1B4332"
          />
        </View>
      ))}

      {loading ? (
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#1B4332" />
          <Text style={styles.loadingText}>Saving round...</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save Round</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default MentalTrackerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 16,
  },
  sliderContainer: {
    marginBottom: 24,
  },
  categoryLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  submitButton: {
    backgroundColor: "#1B4332",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  loaderWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#2D6A4F",
    fontSize: 16,
  },
});
