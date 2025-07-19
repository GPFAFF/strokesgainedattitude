import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { colors } from "../theme";

const CARD_WIDTH = Dimensions.get("window").width * 0.9;
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
        initialSpacing={23}
        color="#1B4332"
        areaChart
        startFillColor="#74C69D"
        endFillColor="#D8F3DC"
        startOpacity={0.3}
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
    marginHorizontal: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.green,
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "scroll",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D6A4F",
    marginBottom: 12,
  },
});
