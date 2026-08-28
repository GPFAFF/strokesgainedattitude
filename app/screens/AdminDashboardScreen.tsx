import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useAuth } from "../hooks/auth";
import { useUserProfile, useRoundCount } from "../hooks/useUserProfile";
import { useMentalCategoryStats } from "../hooks/useMentalCategoryStats";
import MentalScoreCarouselWithDetails from "../components/MentalScoreCarousel";
import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";
import { colors, spacing } from "../theme";
import { RootStackParamList } from "../lib/types";

export default function AdminDashboardScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { userId, authLoading } = useAuth();
  const { isLoading: profileLoading } = useUserProfile(userId);
  const {
    data: scores = [],
    isLoading: scoresLoading,
    error,
  } = useMentalCategoryStats(userId);

  const loading = authLoading || profileLoading || scoresLoading;

  const { data: roundsCount = 0 } = useRoundCount(userId);

  return (
    <ScreenWrapper loading={loading}>
      <HeaderBar title={`Trends`} />
      <View style={styles.container}>
        <Text style={styles.paragraph}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
            }}
          >
            {roundsCount}
          </Text>{" "}
          rounds tracking your mental performance.
        </Text>
        <Text style={styles.paragraph}>
          Here are your average scores by category:
        </Text>

        {error && (
          <Text style={styles.errorText}>
            Failed to load scores: {error.message}
          </Text>
        )}

        <MentalScoreCarouselWithDetails scores={scores} />

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("Log")
          }
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
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  paragraph: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: "left",
  },
  errorText: {
    color: colors.danger,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: 10,
    marginTop: spacing.lg,
    alignItems: "center",
  },
  buttonText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: "600",
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 16,
    color: colors.primaryDark,
  },
});
