import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing } from "../theme";

export default function HeaderBar({ title = "", showIcon = true }) {
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack && navigation.canGoBack();
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {canGoBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primaryDark} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {showIcon && (
        <Image style={styles.tinyLogo} source={require("../assets/logo.png")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    // padding: 8,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primaryDark,
    textAlignVertical: "center",
  },
  tinyLogo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    borderRadius: 8,
  },
});
