import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { fetchMentalRounds } from "../services/fetchMentalRound";
import { LineChart } from "react-native-chart-kit";
import useAuth from "../hooks/auth";

export default function ChartScreen() {
  const { user } = useAuth();

  const [rounds, setRounds] = useState<
    { id: string; scores?: Record<string, number> }[]
  >([]);

  useEffect(() => {
    const loadRounds = async () => {
      const data = await fetchMentalRounds(user);
      setRounds(data);
    };
    loadRounds();
  }, []);

  const labels = rounds.map((r, i) => `R${i + 1}`);
  const concepts = Object.keys(rounds[0]?.scores || {});
  const datasets = concepts.map((concept) => ({
    data: rounds.map((r) => (r?.scores && r?.scores[concept]) || 0),
    strokeWidth: 2,
  }));

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to view charts</Text>
      </View>
    );
  }

  if (rounds.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No rounds available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mental Trends</Text>
      {concepts.map((concept, index) => (
        <View key={concept}>
          <Text style={styles.chartTitle}>{concept}</Text>
          <LineChart
            data={{
              labels,
              datasets: [{ data: datasets[index].data }],
            }}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 12 }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  chartTitle: { fontSize: 18, fontWeight: "600", marginVertical: 8 },
});
