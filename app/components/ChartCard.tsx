import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { colors, spacing } from "../theme";

const CARD_WIDTH = Dimensions.get("window").width - 32; // Same logic

const CARD_HEIGHT = Dimensions.get("window").height * 0.55;

export default React.memo(function ChartCard({
  concept,
  rounds,
  animate,
}: {
  concept: string;
  rounds: { scores?: Record<string, number> }[];
  animate: boolean;
}) {
  const data = useMemo(
    () =>
      rounds.map((r, i) => ({
        value: r.scores?.[concept] ?? 0,
        label: `R${i + 1}`,
      })),
    [rounds, concept]
  );

  return (
    <View style={styles.card}>
      <Text style={styles.chartTitle}>{concept}</Text>
      <LineChart
        data={data}
        spacing={40}
        thickness={2}
        color={colors.primaryDark}
        areaChart
        startFillColor={colors.primary}
        endFillColor={colors.surfaceAlt}
        startOpacity={0.6}
        endOpacity={0}
        yAxisLabelWidth={50}
        maxValue={5}
        noOfSections={5}
        isAnimated={animate}
        hideDataPoints={!animate}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.primaryDark,
    marginBottom: spacing.lg,
    marginLeft: 0, // avoid offset if misaligned
  },
});
