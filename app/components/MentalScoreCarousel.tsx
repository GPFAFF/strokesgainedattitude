import React, { useRef, useState, useEffect } from "react";

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
  Animated,
} from "react-native";
import PaginationDots from "./PaginationDots";

import { Ionicons } from "@expo/vector-icons";

import { colors } from "../theme";
import { LineChart } from "react-native-gifted-charts";

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

const EmptyOverlay = ({
  message,
  icon = "information-circle-outline",
  style,
}: {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: any;
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[styles.emptyOverlayBase, style, { opacity: fadeAnim }]}
    >
      <Ionicons
        name={icon}
        size={48}
        color={colors.white}
        style={{ marginBottom: 12 }}
      />
      <Text style={styles.emptyText}>{message}</Text>
    </Animated.View>
  );
};

const MentalScoreScrollPager = ({ scores }: Props) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  console.log("🔥 MentalScoreScrollPager scores:", scores);

  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const SCREEN_WIDTH = Dimensions.get("window").width;
  const WRAPPER_PADDING = 16; // from ScreenWrapper
  const CARD_WIDTH = SCREEN_WIDTH - WRAPPER_PADDING * 2;

  const chartWidth = CARD_WIDTH + WRAPPER_PADDING;

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

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.chartContainer,
          {
            display: "flex",
          },
        ]}
      >
        {scores.length === 0 && (
          <EmptyOverlay
            message="Add scores to see chart insights"
            style={styles.chartOverlay}
          />
        )}
        <View style={{ width: chartWidth, alignSelf: "center" }}>
          <LineChart
            adjustToWidth
            data={scores.map((item, index) => ({
              value: item.averageScore,
              label:
                item.category.length > 12
                  ? item.category.slice(0, 10) + "…"
                  : item.category,
              focused: index === activeIndex,
              customDataPoint:
                index === activeIndex
                  ? () => (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: "#1B4332",
                          borderRadius: 6,
                          borderWidth: 2,
                          borderColor: "#74C69D",
                        }}
                      />
                    )
                  : undefined,
            }))}
            areaChart
            hideDataPoints={false}
            // dataPointsColor="#74C69D"
            dataPointsRadius={4}
            focusedDataPointColor="#1B4332"
            // focusedDataPointRadius={6}
            startFillColor="#74C69D"
            endFillColor="#D8F3DC"
            isAnimated
            noOfSections={5}
            startOpacity={0.6}
            endOpacity={0}
            maxValue={5}
            xAxisLabelTextStyle={{ width: 0, display: "none" }}
            yAxisTextStyle={{ width: 0, display: "none" }}
            initialSpacing={5}
            spacing={25}
            thickness={2}
            hideRules
            hideYAxisText
            xAxisThickness={0}
            xAxisColor="transparent"
            yAxisThickness={0}
            yAxisColor="transparent"
          />
        </View>
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.category}
          data={scores}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          ListEmptyComponent={
            <EmptyOverlay
              message="Add rounds to unlock these insights"
              style={styles.cardOverlay}
            />
          }
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <View
                style={[styles.card, { marginHorizontal: WRAPPER_PADDING }]}
              >
                <TouchableOpacity onPress={() => toggleDetails(item.category)}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.score}>
                    {item.averageScore.toFixed(1)}
                  </Text>
                  <Text style={styles.tapText}>
                    {expandedCategory === item.category
                      ? "Tap to Collapse"
                      : "Tap for Details"}
                  </Text>
                </TouchableOpacity>

                {expandedCategory === item.category && (
                  <View style={styles.detailsContainer}>
                    {item.concepts.map((c: CategoryScore["concepts"][number]) => (
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
      </View>

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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  card: {
    backgroundColor: colors.green,
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
    borderWidth: 1,
    borderColor: colors.darkGreen,
    width: "100%",
  },
  chartContainer: {
    marginBottom: -32,
    marginTop: 8,
    height: 200,
  },
  chartLabel: {
    fontSize: 18,
    color: colors.deepNavy,
    marginBottom: 8,
    fontWeight: "600",
  },
  category: {
    color: colors.darkGreen,
    fontSize: 20,
    fontWeight: "600",
  },
  score: {
    color: colors.darkGreen,
    fontSize: 32,
    fontWeight: "bold",
  },
  tapText: {
    color: colors.darkGreen,
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
  emptyOverlayBase: {
    justifyContent: "center",
    alignItems: "center",
    height: 180,
    backgroundColor: "rgba(80, 76, 76, 0.85)",
    borderRadius: 8,
    zIndex: 5,
    width: 360,
  },
  chartOverlay: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardOverlay: {
    justifyContent: "center",
    alignItems: "center",
    height: 180,
    backgroundColor: "rgba(80, 76, 76, 0.85)",
    borderRadius: 8,
    padding: 20,
    zIndex: 5,
    marginTop: 12,
    width: 340,
  },
  emptyText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default MentalScoreScrollPager;
