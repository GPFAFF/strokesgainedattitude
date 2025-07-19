import React, { useRef, useEffect } from "react";
import { View, Animated, StyleSheet } from "react-native";

type Props = {
  count: number;
  activeIndex: number;
  maxVisible?: number;
};

const DOT_SIZE = 8;
const DOT_SPACING = 8;
const DOT_FULL_WIDTH = DOT_SIZE + DOT_SPACING;

export default function PaginationDots({
  count,
  activeIndex,
  maxVisible = 7,
}: Props) {
  const animValue = useRef(new Animated.Value(activeIndex)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: activeIndex,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  const maxShift = DOT_FULL_WIDTH * (count - maxVisible);
  if (count <= 0) return null;
  if (count <= maxVisible) {
    maxVisible = count;
  }
  const translateX = animValue.interpolate({
    inputRange: [0, count - 1],
    outputRange: [0, -maxShift],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.clip, { width: DOT_FULL_WIDTH * maxVisible }]}>
      <Animated.View style={[styles.row, { transform: [{ translateX }] }]}>
        {Array.from({ length: count }).map((_, i) => {
          const inputRange = [i - 1, i, i + 1];
          const scale = animValue.interpolate({
            inputRange,
            outputRange: [1, 1.5, 1],
            extrapolate: "clamp",
          });
          const opacity = animValue.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  transform: [{ scale }],
                  opacity,
                  backgroundColor: "#1B4332",
                },
              ]}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
    alignSelf: "center",
    marginTop: 10,
    height: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    marginHorizontal: DOT_SPACING / 2,
  },
});
