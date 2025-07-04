import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { fetchMentalRounds } from "../services/fetchMentalRound";
import useAuth from "../hooks/auth";

export default function RoundHistoryScreen() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<
    {
      id: string;
      createdAt?: { toDate: () => Date };
      scores?: Record<string, number>;
    }[]
  >([]);

  useEffect(() => {
    const loadRounds = async () => {
      const data = await fetchMentalRounds(user);
      setRounds(data);
    };
    loadRounds();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Round History</Text>
      <FlatList
        data={rounds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.roundItem}>
            <Text>
              Date: {item.createdAt?.toDate?.().toLocaleString?.() || "Unknown"}
            </Text>
            <Text>
              Scores:{" "}
              {Object.entries(item.scores || {})
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  roundItem: {
    marginBottom: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
