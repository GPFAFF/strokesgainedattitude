import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

export default function ScreenWrapper({ children }) {
  return <SafeAreaView style={styles.wrapper}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff", // or your app background
  },
});
