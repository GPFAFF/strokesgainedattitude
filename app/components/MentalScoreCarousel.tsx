import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  FlatList,
  ViewToken,
} from "react-native";
import PaginationDots from "./PaginationDots";
import { usePaginationDots } from "../hooks/usePaginationDots";
import useAuth from "../hooks/auth";
import { colors } from "../theme";
import { LineChart } from "react-native-gifted-charts";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth;
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
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const { width: screenWidth } = Dimensions.get("window");
  const CARD_PADDING = 16;
  const CARD_WIDTH = screenWidth - CARD_PADDING * 2;

  const toggleDetails = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const values = scores.map((s) => s.averageScore);
  const yPadding = 0.5;

  const windowSize = 2;
  const start = Math.max(0, activeIndex - windowSize);
  const end = Math.min(scores.length, activeIndex + windowSize + 1);
  const localValues = values.slice(start, end);

  const localMin = Math.min(...localValues);
  const localMax = Math.max(...localValues);

  // optionally enforce a minimum range
  const minRange = 1;
  const rawMin = Math.max(0, localMin - yPadding);
  const rawMax = Math.min(5, localMax + yPadding);
  const minValue = Math.min(rawMin, rawMax - minRange);
  const maxValue = Math.max(rawMax, minValue + minRange);

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartLabel}>Category Trends</Text>
        <View style={{ width: CARD_WIDTH, alignSelf: "center" }}>
          <LineChart
            adjustToWidth={true}
            data={scores.map((item, index) => ({
              value: item.averageScore,
              label:
                item.category.length > 12
                  ? item.category.slice(0, 10) + "…"
                  : item.category,
              customDataPoint:
                index === activeIndex
                  ? () => (
                      <View
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 7,
                          backgroundColor: "#40916c",
                          borderWidth: 2,
                          borderColor: "#fff",
                        }}
                      />
                    )
                  : undefined,
            }))}
            curved
            areaChart
            hideDataPoints={false}
            color="#52b788"
            thickness={2}
            isAnimated
            noOfSections={5}
            spacing={22}
            initialSpacing={0}
            xAxisColor="transparent"
            yAxisColor="transparent"
            xAxisLabelTextStyle={{
              color: "#ccc",
              fontSize: 10,
              rotation: 30,
              width: 50,
              textAlign: "center",
            }}
            yAxisTextStyle={{
              color: "#ccc",
              fontSize: 10,
            }}
            height={100}
            maxValue={maxValue}
            // minValue property removed as it is not supported
          />
        </View>
      </View>
      <FlatList
        horizontal
        pagingEnabled
        snapToInterval={screenWidth}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        keyExtractor={(item) => item.category}
        data={scores}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth }}>
            <View style={[styles.card, { marginHorizontal: CARD_PADDING }]}>
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
                      <Text style={styles.conceptText}>{c.score}</Text>
                      <Text style={styles.detailScore}>{c.concept} / 3</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      />

      {scores.length > 1 && (
        <PaginationDots
          count={scores.length}
          activeIndex={activeIndex}
          maxVisible={7}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.duskGray,
    borderRadius: 8,
    padding: 20,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: 0,
    marginRight: 32,
  },
  chartContainer: {
    marginBottom: 16,
    marginTop: 8,
    overflow: "hidden",
    opacity: 0.7, // ← add this
  },
  chartLabel: {
    fontSize: 18,
    color: colors.deepNavy,
    marginBottom: 8,
    fontWeight: "600",
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 10,
    width: "100%",
  },
  detailItem: {
    width: "48%",
    marginBottom: 8,
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
});

export default MentalScoreScrollPager;
