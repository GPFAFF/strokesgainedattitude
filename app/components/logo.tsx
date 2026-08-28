import { View, Image, StyleSheet, Text } from "react-native";
import React from "react";
import { colors, spacing } from "../theme";

const Logo = () => {
  return (
    <View>
      <Image style={styles.tinyLogo} source={require("../assets/logo.png")} />
      <Text style={styles.subtitle}>
        The first mental game tracker for golfers focused on mindset, routine,
        and emotional resilience.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
    marginBottom: spacing.xl,
    color: colors.textPrimary,
    textAlign: "center",
    fontWeight: "500",
  },
  tinyLogo: {
    width: 300,
    height: 300,
    alignSelf: "center",
    borderRadius: 8,
  },
});

export default Logo;
