import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";

import { useAuth } from "../hooks/auth";
import ScreenWrapper from "../components/ScreenWrapper";
import { usePaginationDots } from "../hooks/usePaginationDots";
import PaginationDots from "../components/PaginationDots";
import HeaderBar from "../components/HeaderBar";
import { colors, spacing } from "../theme";
import { useMentalRounds } from "../hooks/useMentalRounds";

const screenWidth = Dimensions.get("window").width;
const CARD_WIDTH = screenWidth - 32;

export default function RoundHistoryScreen() {
  const { userId } = useAuth();
  const { data = [], isLoading: roundsLoading } = useMentalRounds(userId);

  const { activeIndex, handleScroll } = usePaginationDots(
    CARD_WIDTH,
    16,
    data.length
  );

  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to view history</Text>
      </View>
    );
  }

  if (roundsLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
          <Text style={styles.loadingText}>Loading Round History...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (data.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.title}>No rounds found</Text>
          <Text style={{ fontSize: 16 }}>
            Start tracking your mental game to see history here!
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  const groupByCategory = (scores: Record<string, number>) => {
    const grouped: Record<string, { concept: string; score: number }[]> = {};
    for (const [concept, score] of Object.entries(scores)) {
      const match = concept.match(/\(([^)]+)\)/);
      const category = match?.[1] || "Uncategorized";
      const cleanedConcept = concept.replace(/\s*\(.*?\)/, "").trim();
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({ concept: cleanedConcept, score });
    }
    return grouped;
  };

  return (
    <ScreenWrapper loading={roundsLoading}>
      <HeaderBar title="History" />
      <View style={styles.container}>
        <ScrollView
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          {data.map((round, i) => {
            const groupedScores = groupByCategory(round.scores || {});
            const roundDate =
              (round.playedAt ? new Date(round.playedAt).toLocaleDateString() : undefined) || "Unknown";

            return (
              <View key={round.id} style={styles.card}>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ paddingBottom: spacing.lg }}
                >
                  <View style={styles.roundHeaderRow}>
                    <View style={styles.roundHeaderColLeft}>
                      <Text style={styles.roundTitle}>{round.courseName}</Text>
                      <Text style={styles.dateText}>{`Round #${i + 1}`}</Text>
                      <Text style={styles.dateText}>{roundDate}</Text>
                    </View>
                    <View style={styles.roundHeaderColRight}>
                      <View style={styles.roundInfoBlock}>
                        {round?.tees?.tee_name && (
                          <View style={styles.roundInfoRow}>
                            <Text style={styles.roundInfoLabel}>Tee:</Text>
                            <Text style={styles.roundInfoValue}>
                              {round.tees.tee_name}
                            </Text>
                          </View>
                        )}
                        {round?.tees?.par_total && (
                          <View style={styles.roundInfoRow}>
                            <Text style={styles.roundInfoLabel}>Par:</Text>
                            <Text style={styles.roundInfoValue}>
                              {round.tees.par_total}
                            </Text>
                          </View>
                        )}
                        {round?.roundScore ? (
                          <View style={styles.roundInfoRow}>
                            <Text style={styles.roundInfoLabel}>Score:</Text>
                            <Text style={styles.roundInfoValue}>
                              {round.roundScore}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {Object.entries(groupedScores).map(([category, items]) => (
                    <View key={category} style={styles.categoryBlock}>
                      {items.map(({ concept, score }) => (
                        <View key={concept} style={styles.row}>
                          <Text style={styles.concept}>{String(concept)}</Text>
                          <Text style={styles.score}>{String(score)}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>
      </View>
      <PaginationDots count={data.length} activeIndex={activeIndex} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primaryDark,
    marginVertical: spacing.md,
    textAlign: "center",
  },
  card: {
    width: CARD_WIDTH,
    height: 500,
    padding: spacing.lg,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  roundTitle: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  categoryBlock: {
    minWidth: CARD_WIDTH - 40,
    marginBottom: spacing.md,
  },
  roundInfoBlock: {
    flexDirection: "column",
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  roundInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  roundInfoLabel: {
    fontWeight: "600",
    color: colors.textSecondary,
    marginRight: spacing.sm,
    fontSize: 14,
  },
  roundInfoValue: {
    color: colors.primaryDark,
    fontSize: 14,
  },
  category: {
    color: colors.primaryDark,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark,
  },
  concept: {
    color: colors.primaryDark,
    fontSize: 14,
  },
  score: {
    color: colors.primaryDark,
    fontWeight: "bold",
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
  roundHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: spacing.sm,
  },
  roundHeaderColLeft: {
    flex: 1,
    minWidth: 120,
  },
  roundHeaderColRight: {
    flex: 1,
    alignItems: "flex-end",
    minWidth: 120,
  },
});
