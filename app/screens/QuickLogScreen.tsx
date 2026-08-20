import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";
import SwipeRater, { RateItem } from "../components/SwipeRater";
import { useAuth } from "../hooks/auth";
import { useSnackbar } from "../context/SnackbarContext";
import { useSaveMentalRound } from "../hooks/useSaveRound";
import mentalConcepts from "../data/mentalConcepts.json";
import { colors, spacing, typography } from "../theme";
import { Course, RootStackParamList, Tee } from "../lib/types";

type Mode = "quick" | "detailed";
type Stage = "rating" | "summary";

type Concept = {
  card: number;
  concept: string;
  category: string;
  trackable: boolean;
};

// Prompt + icon copy keyed on category name. Categories without an entry fall
// back to a generic prompt, so nothing breaks if the data's names change.
const CATEGORY_COPY: Record<
  string,
  { prompt: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  Commitment: { prompt: "Did you commit to each shot?", icon: "flag" },
  Recovery: { prompt: "How well did you bounce back?", icon: "refresh" },
  Pressure: { prompt: "How did you handle pressure?", icon: "speedometer" },
  "Goal Setting": { prompt: "Were your targets clear?", icon: "locate" },
  Routine: { prompt: "Did you stick to your routine?", icon: "repeat" },
  Awareness: { prompt: "Were you tuned in out there?", icon: "eye" },
  Preparation: { prompt: "Did you prepare well?", icon: "clipboard" },
  "Emotional Control": { prompt: "Did you stay level?", icon: "heart" },
  Trust: { prompt: "Did you trust your swing?", icon: "shield-checkmark" },
  Focus: { prompt: "How was your focus?", icon: "scan" },
  Confidence: { prompt: "How confident did you feel?", icon: "trending-up" },
  Patience: { prompt: "Were you patient?", icon: "hourglass" },
  Acceptance: { prompt: "Did you accept bad breaks?", icon: "leaf" },
  "Decision Making": { prompt: "Were your decisions sound?", icon: "git-branch" },
};

const trackable = (mentalConcepts as Concept[]).filter((c) => c.trackable);

// Category -> its concepts, preserving first-seen order.
const conceptsByCategory = trackable.reduce<Record<string, string[]>>(
  (acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c.concept);
    return acc;
  },
  {}
);

export default function QuickLogScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { firebaseUser: user, authLoading } = useAuth();
  const showSnackbar = useSnackbar();
  const { mutateAsync: saveRound, isPending } = useSaveMentalRound();

  const [mode, setMode] = useState<Mode>("quick");
  const [stage, setStage] = useState<Stage>("rating");
  const [scores, setScores] = useState<Record<string, number>>({});

  const [course, setCourse] = useState<Course | null>(null);
  const [tee, setTee] = useState<Tee | null>(null);
  const [roundScore, setRoundScore] = useState<number | null>(null);
  const [putts, setPutts] = useState<number | null>(null);

  const items: RateItem[] = useMemo(() => {
    if (mode === "quick") {
      return Object.keys(conceptsByCategory).map((category) => ({
        key: category,
        title: category,
        subtitle: CATEGORY_COPY[category]?.prompt ?? "How did this go today?",
        icon: CATEGORY_COPY[category]?.icon ?? "golf",
      }));
    }
    return trackable.map((c) => ({
      key: c.concept,
      title: c.concept,
      subtitle: c.category,
      icon: CATEGORY_COPY[c.category]?.icon ?? "golf",
    }));
  }, [mode]);

  // Both modes must produce a concept-keyed map so the save hook and the
  // server-side category aggregation stay unchanged. In quick mode each
  // category rating is applied to every concept in that category.
  const handleComplete = useCallback(
    (raw: Record<string, number>) => {
      if (mode === "detailed") {
        setScores(raw);
      } else {
        const expanded: Record<string, number> = {};
        for (const [category, value] of Object.entries(raw)) {
          for (const concept of conceptsByCategory[category] ?? []) {
            expanded[concept] = value;
          }
        }
        setScores(expanded);
      }
      setStage("summary");
    },
    [mode]
  );

  const openCourseModal = () => {
    navigation.navigate("SelectCourse", {
      onSelect: ({ course: c, tee: t }: { course: Course; tee: Tee }) => {
        setCourse(c);
        setTee(t);
      },
    });
  };

  const resetAll = () => {
    setScores({});
    setCourse(null);
    setTee(null);
    setRoundScore(null);
    setPutts(null);
    setStage("rating");
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await saveRound({
        user,
        scores,
        // Course is optional — only send courseInfo when a tee was picked.
        courseInfo:
          course && tee
            ? {
                courseId: course.id,
                courseName: course.name,
                courseCity: course.city,
                courseState: course.state,
                tees: tee,
              }
            : undefined,
        roundScore: roundScore ?? undefined,
        putts: putts ?? undefined,
      });

      showSnackbar("Round saved!", "success");
      resetAll();
      navigation.navigate("Home");
    } catch {
      showSnackbar("Failed to save round", "error");
    }
  };

  if (authLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!user) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Text style={styles.muted}>Log in to track a round.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (stage === "rating") {
    return (
      <ScreenWrapper>
        <HeaderBar title="Log Round" />

        <View style={styles.toggleRow}>
          {(["quick", "detailed"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => {
                setMode(m);
                setScores({});
              }}
              style={[styles.toggle, mode === m && styles.toggleActive]}
            >
              <Text
                style={[
                  styles.toggleText,
                  mode === m && styles.toggleTextActive,
                ]}
              >
                {m === "quick" ? "Quick" : "Detailed"}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.modeHint}>
          {mode === "quick"
            ? `${items.length} categories · about a minute`
            : `${items.length} concepts · the full picture`}
        </Text>

        <SwipeRater
          // Remount when the mode changes so ratings never carry across modes.
          key={mode}
          items={items}
          onComplete={handleComplete}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title="Save Round" />
      <ScrollView contentContainerStyle={styles.summary}>
        <View style={styles.doneBadge}>
          <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
          <Text style={styles.doneText}>
            {Object.keys(scores).length} ratings captured
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Course (optional)</Text>
        <Pressable onPress={openCourseModal} style={styles.courseButton}>
          <Ionicons
            name={course ? "golf" : "add-circle-outline"}
            size={20}
            color={colors.primaryDark}
          />
          <Text style={styles.courseText}>
            {course ? `${course.name} · ${tee?.tee_name}` : "Attach a course"}
          </Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Score (optional)</Text>
        <View style={styles.statsRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Score"
            placeholderTextColor={colors.textMuted}
            value={roundScore ? String(roundScore) : ""}
            onChangeText={(t) => {
              const n = parseInt(t, 10);
              setRoundScore(isNaN(n) ? null : n);
            }}
          />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Putts"
            placeholderTextColor={colors.textMuted}
            value={putts ? String(putts) : ""}
            onChangeText={(t) => {
              const n = parseInt(t, 10);
              setPutts(isNaN(n) ? null : n);
            }}
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={isPending}
          style={[styles.saveButton, isPending && { opacity: 0.6 }]}
        >
          <Text style={styles.saveText}>
            {isPending ? "Saving…" : "Save Round"}
          </Text>
        </Pressable>

        <Pressable onPress={resetAll} style={styles.redoButton}>
          <Text style={styles.redoText}>Start over</Text>
        </Pressable>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { ...typography.body, color: colors.textMuted },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.sm,
  },
  toggle: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 9,
    alignItems: "center",
  },
  toggleActive: { backgroundColor: colors.bg },
  toggleText: { ...typography.bodyStrong, color: colors.textMuted },
  toggleTextActive: { color: colors.textPrimary },
  modeHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  summary: { padding: spacing.md, paddingBottom: spacing.xl },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  doneText: { ...typography.h3, color: colors.textPrimary },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  courseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  courseText: { ...typography.body, color: colors.textPrimary, flex: 1 },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    textAlign: "center",
    color: colors.textPrimary,
    ...typography.body,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveText: { ...typography.bodyStrong, color: colors.onAccent },
  redoButton: { padding: spacing.md, alignItems: "center" },
  redoText: { ...typography.body, color: colors.textMuted },
});
