import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  ScrollView,
} from "react-native";
import { Pagination } from "react-native-snap-carousel";
import PaginationDots from "./PaginationDots";
import { usePaginationDots } from "../hooks/usePaginationDots";
import useAuth from "../hooks/auth";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.6;
const SPACING = 16;

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CategoryScore = {
  category: string;
  averageScore: number;
  concepts: { concept: string; score: number }[];
};

type Props = {
  scores: CategoryScore[];
};

const MentalScoreScrollPager = ({ scores }: Props) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { user } = useAuth();
  const { activeIndex, handleScroll } = usePaginationDots(
    CARD_WIDTH,
    SPACING,
    scores.length
  );

  const toggleDetails = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <View style={styles.wrapper}>
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
        {scores.map((item) => (
          <View key={item.category} style={styles.card}>
            <TouchableOpacity onPress={() => toggleDetails(item.category)}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.score}>{item.averageScore.toFixed(1)}</Text>
              <Text style={styles.tapText}>
                {expandedCategory === item.category
                  ? "Tap to Collapse"
                  : "Tap for Details"}
              </Text>
            </TouchableOpacity>

            {expandedCategory === item.category && (
              <View style={styles.detailsContainer}>
                {item.concepts.map((c) => (
                  <View key={c.concept} style={styles.detailItem}>
                    <Text style={styles.conceptText}>{c.concept}</Text>
                    <Text style={styles.detailScore}>{c.score} / 3</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      <PaginationDots
        count={scores.length}
        activeIndex={activeIndex}
        maxVisible={7}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  card: {
    width: CARD_WIDTH,
    marginHorizontal: SPACING / 4,
    backgroundColor: "#1B4332",
    borderRadius: 8,
    padding: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  category: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  score: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 4,
  },
  tapText: {
    color: "#cfcfcf",
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 10,
    width: "100%",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#2D6A4F",
  },
  conceptText: {
    color: "#ffffff",
    fontSize: 16,
  },
  detailScore: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    marginTop: 10,
    marginHorizontal: SPACING / 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#1B4332",
    width: 10,
    height: 10,
  },
});

export default MentalScoreScrollPager;
