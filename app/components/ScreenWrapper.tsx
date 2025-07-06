import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  View,
} from "react-native";

export default function ScreenWrapper({ children }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      > */}
      {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}> */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
      {/* </TouchableWithoutFeedback> */}
      {/* </KeyboardAvoidingView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    // padding: 16,
  },
});
