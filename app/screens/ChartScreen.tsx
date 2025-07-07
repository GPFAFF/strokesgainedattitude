import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import HeaderBar from "../components/HeaderBar";
import ChartCard from "../components/ChartCard";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;
const SPACING = 16;

export default function ChartScreen() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<
    { id: string; scores?: Record<string, number> }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [visibleIndex, setVisibleIndex] = useState(0);
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length) setVisibleIndex(viewableItems[0].index);
  }).current;

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

  console.log("concepts:", concepts);

  return (
    <ScreenWrapper>
      <HeaderBar title="Mental Game Charts" />
      <View style={styles.container}>
        <FlatList
          data={concepts}
          keyExtractor={(c) => c}
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH + SPACING}
          snapToAlignment="center"
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: SPACING / 2 }}
          renderItem={({ item, index }) => (
            <ChartCard
              concept={item}
              rounds={rounds}
              animate={index === visibleIndex}
            />
          )}
          initialNumToRender={1}
          windowSize={3}
          removeClippedSubviews
          viewabilityConfig={viewConfig}
          onViewableItemsChanged={onViewableItemsChanged}
        />
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
    height: Dimensions.get("window").height * 0.55, // 55% of screen height
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
