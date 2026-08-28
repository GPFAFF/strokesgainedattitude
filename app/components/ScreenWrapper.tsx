import React, { ReactNode } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, spacing } from "../theme";
import LoadingCard from "./LoadingCard";

type Props = {
  children: ReactNode;
  scroll?: boolean;
  loading?: boolean;
};

export default function ScreenWrapper({
  children,
  scroll = true,
  loading = false,
}: Props) {
  const Wrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <Wrapper
          style={styles.flex}
          contentContainerStyle={scroll ? styles.scrollContainer : undefined}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.inner}>
            {loading ? (
              <>
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </>
            ) : (
              children
            )}
          </View>
        </Wrapper>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    marginTop: -8,
  },
  inner: {
    flex: 1,
    padding: spacing.md,
  },
});
