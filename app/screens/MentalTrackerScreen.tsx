import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ScreenWrapper from "../components/ScreenWrapper";
import { useAuth } from "../hooks/auth";
import { useSnackbar } from "../context/SnackbarContext";
import { usePaginationDots } from "../hooks/usePaginationDots";
import PaginationDots from "../components/PaginationDots";
import HeaderBar from "../components/HeaderBar";

import mentalConcepts from "../data/mentalConcepts.json";
import { colors, spacing } from "../theme";
import { useSaveMentalRound } from "../hooks/useSaveRound";
import { Course, RootStackParamList, Tee } from "../lib/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const WRAPPER_PADDING = 16;
const CARD_WIDTH = SCREEN_WIDTH - WRAPPER_PADDING * 2;

function parseIntOrNull(text: string): number | null {
  const n = parseInt(text, 10);
  return isNaN(n) ? null : n;
}

export default function MentalTrackerScreen() {
  const { firebaseUser: user, authLoading } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const showSnackbar = useSnackbar();
  const { mutateAsync: saveRound } = useSaveMentalRound();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState<Tee | null>(null);
  const [trackableConcepts, setTrackableConcepts] = useState<
    { card: number; concept: string; category: string; trackable: boolean }[]
  >([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundScore, setRoundScore] = useState<number | null>(null);
  const [putts, setPutts] = useState<number | null>(null);
  const [fairwaysHit, setFairwaysHit] = useState<number | null>(null);
  const [greensInRegulation, setGreensInRegulation] = useState<number | null>(
    null
  );

  const { activeIndex, handleScroll } = usePaginationDots(
    CARD_WIDTH,
    WRAPPER_PADDING,
    trackableConcepts.length
  );

  useEffect(() => {
    const filtered = mentalConcepts.filter((c) => c.trackable);
    setTrackableConcepts(filtered);

    const defaultScores: Record<string, number> = {};
    filtered.forEach((c) => {
      defaultScores[c.concept] = 3;
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
      onSelect: ({ course, tee }: { course: Course; tee: Tee }) => {
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
        roundScore: roundScore ?? undefined,
        putts: putts ?? undefined,
        fairwaysHit: fairwaysHit ?? undefined,
        greensInRegulation: greensInRegulation ?? undefined,
      });

      showSnackbar("Round saved successfully!", "success");
      setScores({});
      setSelectedCourse(null);
      setSelectedTee(null);
      setRoundScore(null);
      setPutts(null);
      setFairwaysHit(null);
      setGreensInRegulation(null);
      navigation.reset({
        index: 0,
        routes: [{ name: "AdminDashboard" }],
      });
    } catch (err) {
      if (err instanceof Error) {
        showSnackbar("Failed to save round", "error");
      }
    }
  };

  if (!user || authLoading) {
    return (
      <ScreenWrapper>
        <ActivityIndicator style={{ marginTop: 40 }} />
        <Text style={{ textAlign: "center" }}>Loading…</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title="Scoring" />
      <View style={styles.container}>
        <TouchableOpacity onPress={openCourseModal}>
          <Text style={[styles.courseButton, { marginBottom: 10 }]}>
            <Text style={styles.saveText}>
              {selectedCourse
                ? `${selectedCourse.name} · ${selectedTee?.tee_name}`
                : "Select Course"}
            </Text>
          </Text>
        </TouchableOpacity>

        {selectedCourse && selectedTee && (
          <View style={styles.statsRow}>
            <TextInput
              style={[styles.input, styles.statInput]}
              keyboardType="numeric"
              placeholder="Score"
              value={roundScore ? String(roundScore) : ""}
              onChangeText={(t) => setRoundScore(parseIntOrNull(t))}
            />
            <TextInput
              style={[styles.input, styles.statInput]}
              keyboardType="numeric"
              placeholder="Putts"
              value={putts ? String(putts) : ""}
              onChangeText={(t) => setPutts(parseIntOrNull(t))}
            />
            <TextInput
              style={[styles.input, styles.statInput]}
              keyboardType="numeric"
              placeholder="FWY"
              value={fairwaysHit ? String(fairwaysHit) : ""}
              onChangeText={(t) => setFairwaysHit(parseIntOrNull(t))}
            />
            <TextInput
              style={[styles.input, styles.statInput]}
              keyboardType="numeric"
              placeholder="GIR"
              value={greensInRegulation ? String(greensInRegulation) : ""}
              onChangeText={(t) => setGreensInRegulation(parseIntOrNull(t))}
            />
          </View>
        )}

        <ScrollView
          horizontal
          pagingEnabled
          scrollEnabled={!!selectedCourse}
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {Object.entries(groupedByCategory).map(([category, concepts]) => (
            <View
              key={category}
              style={{ width: CARD_WIDTH, position: "relative" }}
            >
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{category}</Text>

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
                        style={[
                          styles.counterButton,
                          (!selectedCourse || !selectedTee) && {
                            opacity: 0.4,
                          },
                        ]}
                        disabled={!selectedCourse || !selectedTee}
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
                        style={[
                          styles.counterButton,
                          (!selectedCourse || !selectedTee) && {
                            opacity: 0.4,
                          },
                        ]}
                        disabled={!selectedCourse || !selectedTee}
                      >
                        <Text style={styles.counterText}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {!selectedCourse || !selectedTee ? (
                <View style={styles.cardOverlay}>
                  <Text style={styles.overlayText}>
                    Select a course to enable scoring
                  </Text>
                </View>
              ) : null}
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
  container: { flex: 1, marginTop: -24 },
  card: {
    width: "100%",
    alignSelf: "center",
    height: 100,
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: "600",
    color: "#2D6A4F",
    marginBottom: 8,
    textAlign: "center",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(61, 58, 58, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    color: "#1B4332",
    backgroundColor: colors.whiteSmoke,
  },
  statInput: {
    flex: 1,
    textAlign: "center",
  },
  overlayText: {
    textAlign: "center",
    color: colors.white,
    fontWeight: "600",
    fontSize: 32,
  },
  sliderContainer: {
    marginBottom: 10,
  },
  conceptLabel: {
    fontSize: 16,
    marginBottom: 6,
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
  courseButton: {
    backgroundColor: colors.sunsetCoral,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: colors.sunsetCoral,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveText: {
    color: colors.white,
    fontSize: spacing.md,
    fontWeight: "600",
  },
});
