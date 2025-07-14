import React, { ReactNode } from "react";
import { SafeAreaView, StyleSheet, ScrollView, View } from "react-native";
import { colors, spacing } from "../theme";

export default function ScreenWrapper({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.warmTaupe,
    marginTop: -24, // Adjust if needed for status bar
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    padding: spacing.md,
  },
});
