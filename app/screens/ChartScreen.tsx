import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { fetchMentalRounds } from "../services/fetchMentalRound";
import useAuth from "../hooks/auth";
import ScreenWrapper from "../components/ScreenWrapper";
import {
  VictoryChart,
  VictoryLine,
  VictoryLegend,
  VictoryAxis,
  VictoryGroup,
} from "victory-native";

import { Svg } from "react-native-svg";

const COLORS = [
  "#1B4332",
  "#2D6A4F",
  "#40916C",
  "#52B788",
  "#74C69D",
  "#95D5B2",
  "#B7E4C7",
  "#D8F3DC",
  "#E9F5DB",
  "#FFE66D",
];

export default function ChartScreen() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<
    { id: string; scores?: Record<string, number> }[]
  >([]);

  useEffect(() => {
    if (!user?.uid) return;

    const loadRounds = async () => {
      const data = await fetchMentalRounds(user);
      setRounds(data);
    };

    loadRounds();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to view charts</Text>
      </View>
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

  const labels = rounds.map((_, i) => `R${i + 1}`);
  const concepts = Object.keys(rounds[0]?.scores || {});
  const datasets: { [concept: string]: { x: string; y: number }[] } = {};

  concepts.forEach((concept) => {
    datasets[concept] = rounds.map((r, i) => ({
      x: `R${i + 1}`,
      y: r?.scores?.[concept] ?? 0,
    }));
  });

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mental Trends</Text>

        <Svg height={400} width={"100%"}>
          <VictoryChart
            theme={VictoryTheme.material}
            domain={{ y: [0, 5.5] }}
            width={400}
            height={400}
            padding={{ top: 40, bottom: 50, left: 50, right: 20 }}
          >
            <VictoryAxis
              tickValues={labels}
              tickFormat={labels}
              style={{ tickLabels: { angle: -45, fontSize: 10 } }}
            />
            <VictoryAxis dependentAxis tickFormat={(t) => `${t}`} />

            <VictoryGroup>
              {concepts.map((concept, index) => (
                <VictoryLine
                  key={concept}
                  data={datasets[concept]}
                  interpolation="monotoneX"
                  style={{
                    data: {
                      stroke: COLORS[index % COLORS.length],
                      strokeWidth: 2,
                    },
                  }}
                />
              ))}
            </VictoryGroup>
          </VictoryChart>
        </Svg>

        <View style={styles.legendWrapper}>
          {concepts.map((concept, index) => (
            <View key={concept} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: COLORS[index % COLORS.length] },
                ]}
              />
              <Text style={styles.legendText}>{concept}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 12,
  },
  legendWrapper: {
    marginTop: 20,
    alignItems: "flex-start",
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: "#333",
  },
});
