import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import ScreenWrapper from "./ScreenWrapper";

const Loading = (text: string) => {
  return (
    <View style={styles.loaderWrapper}>
      <ActivityIndicator size="large" color="#1B4332" />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2D6A4F",
  },
});

export default Loading;
