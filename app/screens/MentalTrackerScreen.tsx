import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import mentalConcepts from "../data/mentalConcepts.json";
import { saveMentalRound } from "../services/saveRound";
import useAuth from "../hooks/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ScreenWrapper from "../components/ScreenWrapper";
import { useSnackbar } from "../context/SnackbarContext";
import { Pagination } from "react-native-snap-carousel";
import PaginationDots from "../components/PaginationDots";
import { usePaginationDots } from "../hooks/usePaginationDots";
import { Header } from "@react-navigation/stack";
import HeaderBar from "../components/HeaderBar";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;
const SPACING = 16;

type RootStackParamList = {
  MentalTracker: undefined;
  AdminDashboard: { refresh: boolean };
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

  const showSnackbar = useSnackbar();

  const { activeIndex, handleScroll } = usePaginationDots(
    CARD_WIDTH,
    SPACING,
    trackableConcepts.length
  );

  useEffect(() => {
    const filtered = mentalConcepts.filter((c) => c.trackable);
    setTrackableConcepts(filtered);

    const defaultScores: { [key: string]: number } = {};
    filtered.forEach((c) => {
      defaultScores[c.concept] = 0;
    });
    setScores(defaultScores);
  }, []);

  if (!user) return <Text>Please log in</Text>;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await saveMentalRound(user, scores);
      navigation.navigate("AdminDashboard", { refresh: true });
      setScores({});
      showSnackbar("Round saved successfully!", "success");
    } catch (error) {
      console.error("Error saving round:", error);
      showSnackbar(
        "An error occurred while saving the round. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Group by category
  const categoryMap: { [category: string]: { concept: string }[] } = {};
  trackableConcepts.forEach(({ concept, category }) => {
    if (!categoryMap[category]) categoryMap[category] = [];
    categoryMap[category].push({ concept });
  });

  if (loading || authLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#1B4332" />
          <Text style={styles.loadingText}>Saving round...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const categories = Object.entries(categoryMap);

  return (
    <ScreenWrapper>
      <HeaderBar title="Mental Round Tracker" />

      <View style={styles.container}>
        <ScrollView
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH + SPACING}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onScroll={handleScroll}
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {categories.map(([category, items]) => (
            <View key={category} style={styles.card}>
              <Text style={styles.cardTitle}>{category}</Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cardScroll}
              >
                {items.map(({ concept }) => (
                  <View key={concept} style={styles.sliderContainer}>
                    <Text style={styles.conceptLabel}>
                      {concept}: {scores[concept]}
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
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
      <PaginationDots
        count={trackableConcepts.length}
        activeIndex={activeIndex}
      />
      <TouchableOpacity
        style={styles.submitButton}
        disabled={!!scores.length}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Save Round</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default MentalTrackerScreen;

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginVertical: 16,
    textAlign: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: Dimensions.get("window").height * 0.5,
    backgroundColor: "#F1F5F2",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: SPACING / 2,
  },
  cardScroll: {
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D6A4F",
    marginBottom: 12,
    textAlign: "center",
  },
  sliderContainer: {
    marginBottom: 20,
  },
  conceptLabel: {
    fontSize: 16,
    marginBottom: 6,
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
    // marginBottom: 40,
    marginHorizontal: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
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
