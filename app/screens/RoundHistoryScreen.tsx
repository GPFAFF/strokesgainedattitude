import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { fetchMentalRounds } from "../services/fetchMentalRound";
import { useAuth } from "../hooks/auth";
import ScreenWrapper from "../components/ScreenWrapper";
import { usePaginationDots } from "../hooks/usePaginationDots";
import PaginationDots from "../components/PaginationDots";
import HeaderBar from "../components/HeaderBar";
import { colors } from "../theme";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.9;
const SPACING = 16;

export default function RoundHistoryScreen() {
  const { firebaseUser: user } = useAuth();
  const [rounds, setRounds] = useState<
    {
      id: string;
      createdAt?: { toDate: () => Date };
      scores?: Record<string, number>;
      courseName?: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    setIsLoading(true);

    const loadRounds = async () => {
      const data = await fetchMentalRounds(user);
      setRounds(data);
      setIsLoading(false);
    };

    loadRounds();
  }, [user]);

  const { activeIndex, handleScroll } = usePaginationDots(
    CARD_WIDTH,
    SPACING,
    rounds.length
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to view history</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#1B4332" />
          <Text style={styles.loadingText}>Loading Round History...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (rounds.length === 0) {
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

  // Group scores by category (assuming you want this view)
  const groupByCategory = (scores: Record<string, number>) => {
    const grouped: Record<string, { concept: string; score: number }[]> = {};
    for (const [concept, score] of Object.entries(scores)) {
      const match = concept.match(/\(([^)]+)\)/); // extract category from "Focus Control (Awareness)"
      const category = match?.[1] || "Uncategorized";
      const cleanedConcept = concept.replace(/\s*\(.*?\)/, "").trim();
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({ concept: cleanedConcept, score });
    }
    return grouped;
  };

  return (
    <ScreenWrapper>
      <HeaderBar title="Round History" />
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
          {rounds.map((round, i) => {
            const groupedScores = groupByCategory(round.scores || {});
            const roundDate =
              round.createdAt?.toDate()?.toLocaleDateString() || "Unknown";

            return (
              <View key={round.id} style={styles.card}>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  <Text style={styles.roundTitle}>Round #{i + 1}</Text>
                  <Text style={styles.dateText}>{roundDate}</Text>
                  <Text style={styles.dateText}>
                    {round.courseName}
                    <Text style={styles.subtitle}>
                      {" "}
                      ({round.tees.tee_name} {round.tees.par_total} Par)
                    </Text>
                  </Text>

                  {Object.entries(groupedScores).map(([category, items]) => (
                    <View key={category} style={styles.categoryBlock}>
                      {items.map(({ concept, score }) => (
                        <View key={concept} style={styles.row}>
                          <Text style={styles.concept}>{concept}</Text>
                          <Text style={styles.score}>{score}</Text>
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
      <PaginationDots count={rounds.length} activeIndex={activeIndex} />
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
    backgroundColor: colors.whiteSmoke,
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
    marginBottom: 16,
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
});
