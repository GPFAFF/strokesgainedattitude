// components/HeaderBar.tsx

import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function HeaderBar({ title = "" }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Image style={styles.tinyLogo} source={require("../assets/logo.png")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#083d27", // your brand green
  },
  tinyLogo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    borderRadius: 8,
  },
});
