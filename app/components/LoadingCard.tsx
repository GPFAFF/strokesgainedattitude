import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function LoadingCard() {
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const shimmerTranslate = translateX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={styles.card}>
      <View style={styles.avatar} />
      <View style={styles.textContainer}>
        <View style={styles.lineShort} />
        <View style={styles.lineLong} />
      </View>

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#E1E9EE",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#CBD2D9",
  },
  textContainer: {
    marginLeft: 16,
    flex: 1,
  },
  lineShort: {
    height: 16,
    width: "50%",
    backgroundColor: "#CBD2D9",
    borderRadius: 8,
    marginBottom: 8,
  },
  lineLong: {
    height: 16,
    width: "80%",
    backgroundColor: "#CBD2D9",
    borderRadius: 8,
  },
});
