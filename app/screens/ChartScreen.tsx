import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { fetchMentalRounds } from "../services/fetchMentalRound";
import { LineChart } from "react-native-gifted-charts";
import useAuth from "../hooks/auth";
import ScreenWrapper from "../components/ScreenWrapper";
import { usePaginationDots } from "../hooks/usePaginationDots";
import PaginationDots from "../components/PaginationDots";
import Loading from "../components/Loading";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;
const SPACING = 16;

export default function ChartScreen() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<
    { id: string; scores?: Record<string, number> }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const loadRounds = async () => {
      try {
        setLoading(true);
        const data = await fetchMentalRounds(user);
        setRounds(data);
      } finally {
        setLoading(false);
      }
    };

    loadRounds();
  }, [user]);

  const labels = rounds.map((_, i) => `R${i + 1}`);
  const concepts = Object.keys(rounds[0]?.scores || {});

  const { activeIndex, handleScroll } = usePaginationDots(
    CARD_WIDTH,
    SPACING,
    concepts.length
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to view charts</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#1B4332" />
          <Text style={styles.loadingText}>Loading charts...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (rounds.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.title}>No rounds available</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Mental Trends</Text>
      <Image
        source={require("../assets/logo.png")} // Adjust the path as needed
        style={{
          width: 150,
          height: 150,
          alignSelf: "center",
          borderRadius: 8,
          // position: "absolute",
          // top: 50,
          // left: 20,
        }}
      />
      <View style={styles.container}>
        <ScrollView
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH + SPACING}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: SPACING / 2 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {concepts.map((concept) => {
            const data = rounds.map((r, i) => ({
              value: r.scores?.[concept] ?? 0,
              label: `R${i + 1}`,
            }));

            return (
              <View key={concept} style={styles.card}>
                <Text style={styles.chartTitle}>{concept}</Text>
                <LineChart
                  data={data}
                  spacing={40}
                  thickness={2}
                  hideDataPoints={false}
                  color="#1B4332"
                  areaChart
                  startFillColor="#74C69D"
                  endFillColor="#D8F3DC"
                  startOpacity={0.3}
                  endOpacity={0}
                  xAxisLabelTextStyle={{ color: "#000" }}
                  yAxisTextStyle={{ color: "#000" }}
                  yAxisLabelWidth={50}
                  maxValue={5}
                  noOfSections={5}
                  isAnimated
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
      <PaginationDots count={concepts.length} activeIndex={activeIndex} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginVertical: 16,
    textAlign: "center",
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 2,
    height: 300,
    backgroundColor: "#F1F5F2",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D6A4F",
    marginBottom: 12,
    textAlign: "center",
  },
});
