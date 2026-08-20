import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useAuth } from "../hooks/auth";
import { useUserProfile } from "../hooks/useUserProfile";
import { useMentalCategoryStats } from "../hooks/useMentalCategoryStats";
import MentalScoreCarouselWithDetails from "../components/MentalScoreCarousel";
import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";
import { colors, spacing } from "../theme";
import { RootStackParamList } from "../lib/types";

export default function AdminDashboardScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { firebaseUser, authLoading } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile(
    firebaseUser?.uid
  );
  const {
    data: scores = [],
    isLoading: scoresLoading,
    error,
  } = useMentalCategoryStats(firebaseUser?.uid);

  const loading = authLoading || profileLoading || scoresLoading;

  const roundsCount = userProfile?.rounds?.length || 0;

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
    color: colors.forestGreen,
    marginBottom: spacing.lg,
  },
  paragraph: {
    fontSize: 16,
    color: colors.charcoal,
    marginBottom: spacing.sm,
    textAlign: "left",
  },
  errorText: {
    color: colors.red,
    marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.sunsetCoral,
    padding: spacing.md,
    borderRadius: 10,
    marginTop: spacing.lg,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    color: colors.darkGreen,
  },
});
