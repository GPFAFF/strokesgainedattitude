// Data Visualization screen/component placeholder// Data Visualization screen/component placeholderimport React from 'react';
import { View, Text, StyleSheet } from "react-native";

const DataVisualizationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Insights</Text>
      <Text>Charts and feedback will be shown here.</Text>
    </View>
  );
};

export default DataVisualizationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
  },
});
