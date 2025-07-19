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
import { colors } from "../theme";
import { useMentalRounds } from "../hooks/useMentalRounds";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.9;
const SPACING = 16;

export default function RoundHistoryScreen() {
  const { firebaseUser: user } = useAuth();
  const { data = [], isLoading: roundsLoading } = useMentalRounds(user);

  const { activeIndex, handleScroll } = usePaginationDots(
    CARD_WIDTH,
    SPACING,
    data.length
  );

  if (!user) {
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
          <ActivityIndicator size="large" color="#1B4332" />
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
          snapToInterval={CARD_WIDTH + SPACING}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          {data.map((round, i) => {
            const groupedScores = groupByCategory(round.scores || {});
            const roundDate =
              round.createdAt?.toDate()?.toLocaleDateString() || "Unknown";

            return (
              <View key={round.id} style={styles.card}>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ paddingBottom: 20 }}
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
    color: "#1B4332",
    marginVertical: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#F1F5F2",
    width: CARD_WIDTH,
    height: 500,
    borderRadius: 8,
    padding: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginHorizontal: SPACING / 2,
  },
  roundTitle: {
    color: "#1B4332",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  dateText: {
    color: "#4B5563",
    fontSize: 14,
    marginBottom: 12,
  },
  categoryBlock: {
    minWidth: CARD_WIDTH - 40,
    marginBottom: 16,
  },
  roundInfoBlock: {
    flexDirection: "column",
    marginBottom: 12,
    marginLeft: 2,
  },
  roundInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  roundInfoLabel: {
    fontWeight: "600",
    color: "#4B5563",
    marginRight: 6,
    fontSize: 14,
  },
  roundInfoValue: {
    color: "#2D6A4F",
    fontSize: 14,
  },
  category: {
    color: "#2D6A4F",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#2D6A4F",
  },
  concept: {
    color: "#2D6A4F",
    fontSize: 14,
  },
  score: {
    color: "#2D6A4F",
    fontWeight: "bold",
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
  roundHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 8,
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
