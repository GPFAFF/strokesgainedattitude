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

import { colors, spacing } from "../theme";
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
        color={colors.onPrimary}
        style={{ marginBottom: spacing.md }}
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
                          backgroundColor: colors.primaryDark,
                          borderRadius: 6,
                          borderWidth: 2,
                          borderColor: colors.primary,
                        }}
                      />
                    )
                  : undefined,
            }))}
            areaChart
            hideDataPoints={false}
            // dataPointsColor="#74C69D"
            dataPointsRadius={4}
            focusedDataPointColor={colors.primaryDark}
            // focusedDataPointRadius={6}
            startFillColor={colors.primary}
            endFillColor={colors.surfaceAlt}
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
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.lg,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: 0,
    marginRight: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    width: "100%",
  },
  chartContainer: {
    marginBottom: -32,
    marginTop: spacing.sm,
    height: 200,
  },
  chartLabel: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  category: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "600",
  },
  score: {
    color: colors.primaryDark,
    fontSize: 32,
    fontWeight: "bold",
  },
  tapText: {
    color: colors.primaryDark,
    fontSize: 14,
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    width: "100%",
  },
  detailItem: {
    width: "48%",
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark,
  },
  conceptText: {
    color: colors.onPrimary,
    fontSize: 16,
  },
  detailScore: {
    color: colors.onPrimary,
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
    padding: spacing.lg,
    zIndex: 5,
    marginTop: spacing.md,
    width: 340,
  },
  emptyText: {
    fontSize: 16,
    color: colors.onPrimary,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default MentalScoreScrollPager;
