import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, spacing } from "../theme";

export default function BumpCounter({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bump = () => {
    scale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withTiming(1, { duration: 150 })
    );
  };

  const increase = () => {
    if (value < 5) {
      onChange(value + 1);
      bump();
    }
  };

  const decrease = () => {
    if (value > 1) {
      onChange(value - 1);
      bump();
    }
  };

  return (
    <View style={styles.counterRow}>
      <TouchableOpacity onPress={decrease} style={styles.bumpButton}>
        <Text style={styles.bumpText}>−</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.bumpValue, animatedStyle]}>
        <Text style={styles.bumpValueText}>{value}</Text>
      </Animated.View>
      <TouchableOpacity onPress={increase} style={styles.bumpButton}>
        <Text style={styles.bumpText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.sm,
  },
  bumpButton: {
    backgroundColor: colors.border,
    padding: spacing.sm,
    borderRadius: 6,
    marginHorizontal: spacing.sm,
  },
  bumpText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bumpValue: {
    paddingHorizontal: spacing.md,
    minWidth: 30,
    alignItems: "center",
  },
  bumpValueText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primaryDark,
  },
});
