import React, { useCallback, useRef, useState } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, typography } from "../theme";

export type RateItem = {
  key: string;
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

type Props = {
  items: RateItem[];
  onComplete: (scores: Record<string, number>) => void;
  onProgress?: (index: number, total: number) => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_OUT_X = SCREEN_WIDTH * 1.25;

// A hard swipe is a shortcut for "about right" / "not great" so a whole round
// can be logged without ever hitting the numbered buttons.
const SWIPE_RIGHT_VALUE = 4;
const SWIPE_LEFT_VALUE = 2;

const FACES: {
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { value: 1, icon: "sad", label: "Poor" },
  { value: 2, icon: "sad-outline", label: "Off" },
  { value: 3, icon: "remove-circle-outline", label: "OK" },
  { value: 4, icon: "happy-outline", label: "Good" },
  { value: 5, icon: "happy", label: "Great" },
];

export default function SwipeRater({ items, onComplete, onProgress }: Props) {
  const [index, setIndex] = useState(0);
  const scoresRef = useRef<Record<string, number>>({});

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const current = items[index];
  const next = items[index + 1];

  // Record a rating and advance. Runs on the JS thread.
  const advance = useCallback(
    (value: number) => {
      const item = items[index];
      if (!item) return;

      scoresRef.current = { ...scoresRef.current, [item.key]: value };
      const nextIndex = index + 1;

      translateX.value = 0;
      translateY.value = 0;

      if (nextIndex >= items.length) {
        onComplete(scoresRef.current);
        return;
      }

      setIndex(nextIndex);
      onProgress?.(nextIndex, items.length);
    },
    [index, items, onComplete, onProgress, translateX, translateY]
  );

  // Fling the card off-screen, then advance once the animation lands.
  const commit = useCallback(
    (value: number, direction: 1 | -1 = 1) => {
      translateX.value = withTiming(
        SWIPE_OUT_X * direction,
        { duration: 180 },
        (finished) => {
          if (finished) runOnJS(advance)(value);
        }
      );
    },
    [advance, translateX]
  );

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.2;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          SWIPE_OUT_X,
          { duration: 180 },
          (finished) => {
            if (finished) runOnJS(advance)(SWIPE_RIGHT_VALUE);
          }
        );
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          -SWIPE_OUT_X,
          { duration: 180 },
          (finished) => {
            if (finished) runOnJS(advance)(SWIPE_LEFT_VALUE);
          }
        );
      } else {
        translateX.value = withSpring(0, { damping: 18 });
        translateY.value = withSpring(0, { damping: 18 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-9, 0, 9],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  // The card behind scales up as the top card is dragged away.
  const peekStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale: 0.94 + progress * 0.06 }],
      opacity: 0.5 + progress * 0.5,
    };
  });

  const goodHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const badHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  if (!current) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {index + 1} of {items.length}
      </Text>

      <View style={styles.stack}>
        {next && (
          <Animated.View style={[styles.card, styles.peekCard, peekStyle]}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {next.title}
            </Text>
          </Animated.View>
        )}

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.card, cardStyle]}>
            <Animated.View
              style={[styles.hint, styles.hintGood, goodHintStyle]}
            >
              <Text style={styles.hintText}>GOOD</Text>
            </Animated.View>
            <Animated.View style={[styles.hint, styles.hintBad, badHintStyle]}>
              <Text style={styles.hintText}>OFF</Text>
            </Animated.View>

            {current.icon && (
              <Ionicons
                name={current.icon}
                size={40}
                color={colors.primaryDark}
                style={styles.cardIcon}
              />
            )}
            <Text style={styles.cardTitle}>{current.title}</Text>
            {current.subtitle ? (
              <Text style={styles.cardSubtitle}>{current.subtitle}</Text>
            ) : null}
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.faceRow}>
        {FACES.map((face) => (
          <Pressable
            key={face.value}
            onPress={() => commit(face.value, face.value >= 3 ? 1 : -1)}
            style={({ pressed }) => [
              styles.faceButton,
              { borderColor: colors.scale[face.value - 1] },
              pressed && { transform: [{ scale: 0.92 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${face.label} — rate ${face.value} of 5`}
          >
            <Ionicons
              name={face.icon}
              size={26}
              color={colors.scale[face.value - 1]}
            />
            <Text style={styles.faceLabel}>{face.value}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.swipeHint}>
        Swipe right for good · left for off · or tap a rating
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "space-between" },
  progress: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  stack: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: "88%",
    minHeight: 220,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  peekCard: { backgroundColor: colors.surfaceAlt },
  cardIcon: { marginBottom: spacing.sm },
  cardTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: "center",
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  hint: {
    position: "absolute",
    top: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 2,
  },
  hintGood: {
    right: spacing.md,
    borderColor: colors.primary,
    transform: [{ rotate: "12deg" }],
  },
  hintBad: {
    left: spacing.md,
    borderColor: colors.danger,
    transform: [{ rotate: "-12deg" }],
  },
  hintText: { ...typography.label, color: colors.textPrimary },
  faceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  faceButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: colors.bg,
  },
  faceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  swipeHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});
