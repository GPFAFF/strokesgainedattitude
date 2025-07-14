import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ScreenWrapper from "../components/ScreenWrapper";
import { saveMentalRound } from "../services/saveRound";
import { useAuth } from "../hooks/auth";
import { useSnackbar } from "../context/SnackbarContext";
import { usePaginationDots } from "../hooks/usePaginationDots";
import PaginationDots from "../components/PaginationDots";
import HeaderBar from "../components/HeaderBar";

import mentalConcepts from "../data/mentalConcepts.json";
import { colors } from "../theme";
import BumpCounter from "../components/BumpCounter";
import { useSaveMentalRound } from "../hooks/useSaveRound";

const { width: screenWidth } = Dimensions.get("window");
const CARD_PADDING = 16;
const CARD_WIDTH = screenWidth - CARD_PADDING * 2;

export default function MentalTrackerScreen() {
  const { firebaseUser: user, authLoading } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const showSnackbar = useSnackbar();

  const { mutateAsync: saveRound, isLoading, error } = useSaveMentalRound();

  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    name: string;
    state: string;
    city: string;
  } | null>(null);
  const [selectedTee, setSelectedTee] = useState(null);
  const [trackableConcepts, setTrackableConcepts] = useState<
    { card: number; concept: string; category: string; trackable: boolean }[]
  >([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false);

  const { activeIndex, handleScroll } = usePaginationDots(
    CARD_WIDTH,
    CARD_PADDING,
    trackableConcepts.length
  );

  useEffect(() => {
    const filtered = mentalConcepts.filter((c) => c.trackable);
    setTrackableConcepts(filtered);

    const defaultScores = {};
    filtered.forEach((c) => {
      defaultScores[c.concept] = 3; // neutral default
    });
    setScores(defaultScores);
  }, []);

  const groupedByCategory = trackableConcepts.reduce<
    Record<
      string,
      { card: number; concept: string; category: string; trackable: boolean }[]
    >
  >((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const openCourseModal = () => {
    navigation.navigate("SelectCourse", {
      onSelect: ({ course, tee }) => {
        setSelectedCourse(course);
        setSelectedTee(tee);
      },
    });
  };

  const handleSave = async () => {
    if (!user || !selectedCourse || !selectedTee) {
      Alert.alert("Missing Info", "Please select course and tee.");
      return;
    }

    try {
      await saveRound({
        user: user!,
        scores,
        courseInfo: {
          courseId: selectedCourse.id,
          courseName: selectedCourse.name,
          courseCity: selectedCourse.city,
          courseState: selectedCourse.state,
          tees: selectedTee,
        },
      });

      showSnackbar("Round saved successfully!", "success");
      setScores({});
      setSelectedCourse(null);
      setSelectedTee(null);
      navigation.reset({
        index: 0,
        routes: [{ name: "AdminDashboard" }],
      });
    } catch (err) {
      console.error("Save failed", err);
      showSnackbar("Failed to save round", "error");
    }
  };

  if (!user || authLoading || loading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator style={{ marginTop: 40 }} />
        <Text style={{ textAlign: "center" }}>Loading…</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title="Mental Tracker" />
      <View style={styles.container}>
        <TouchableOpacity onPress={openCourseModal}>
          <Text
            style={[
              styles.courseSelector,
              !selectedCourse && {
                backgroundColor: colors.lightGray,
                width: 125,
                padding: 10,
                borderRadius: 8,
              },
            ]}
          >
            {selectedCourse
              ? `${selectedCourse.name} · ${selectedTee?.tee_name}`
              : "Select Course"}
          </Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          pagingEnabled
          snapToInterval={screenWidth}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {Object.entries(groupedByCategory).map(([category, concepts]) => (
            <View key={category} style={{ width: screenWidth }}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{category}</Text>
                {/* <ScrollView contentContainerStyle={styles.cardScroll}> */}
                {concepts.map(({ concept }) => (
                  <View key={concept} style={styles.sliderContainer}>
                    <Text style={styles.conceptLabel}>{concept}</Text>

                    <View style={styles.counterRow}>
                      <TouchableOpacity
                        onPress={() =>
                          setScores((prev) => ({
                            ...prev,
                            [concept]: Math.max(1, prev[concept] - 1),
                          }))
                        }
                        style={styles.counterButton}
                      >
                        <Text style={styles.counterText}>−</Text>
                      </TouchableOpacity>

                      <Text style={styles.counterValue}>{scores[concept]}</Text>

                      <TouchableOpacity
                        onPress={() =>
                          setScores((prev) => ({
                            ...prev,
                            [concept]: Math.min(5, prev[concept] + 1),
                          }))
                        }
                        style={styles.counterButton}
                      >
                        <Text style={styles.counterText}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                {/* </ScrollView> */}
              </View>
            </View>
          ))}
        </ScrollView>

        <PaginationDots
          count={Object.keys(groupedByCategory).length}
          activeIndex={activeIndex}
        />

        <TouchableOpacity
          onPress={handleSave}
          style={[
            styles.saveButton,
            !selectedCourse || !selectedTee ? { opacity: 0.5 } : {},
          ]}
          disabled={!selectedCourse || !selectedTee}
        >
          <Text style={styles.saveText}>Save Round</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  courseSelector: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 20,
    color: "#1B4332",
  },
  card: {
    width: CARD_WIDTH, // full screen minus padding
    paddingHorizontal: 16,
    alignSelf: "center",
    backgroundColor: "#F1F5F2",
    borderRadius: 8,
    padding: 20,
    height: Dimensions.get("window").height * 0.49,

    marginRight: 32,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "#2D6A4F",
    marginBottom: 8,
    textAlign: "center",
  },
  cardScroll: {
    paddingBottom: 10,
  },
  sliderContainer: {
    marginBottom: 10,
  },
  conceptLabel: {
    fontSize: 16,
    marginBottom: 6,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 20,
    marginTop: 6,
  },
  counterButton: {
    backgroundColor: "#1B4332",
    width: 100,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  counterText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  counterValue: {
    fontSize: 32,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: colors.sunsetCoral,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
