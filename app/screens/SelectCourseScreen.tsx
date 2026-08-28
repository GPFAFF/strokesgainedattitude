import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CourseSearchBar from "../components/CourseSearch";
import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";
import { colors, spacing } from "../theme";
import { Course, RootStackParamList, Tee } from "../lib/types";

export default function SelectCourseScreen() {
  const route = useRoute<RouteProp<RootStackParamList>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onSelect = (route.params as RootStackParamList["SelectCourse"])?.onSelect;

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState<Tee | null>(null);

  const allTees =
    selectedCourse?.tees?.male?.concat(selectedCourse?.tees?.female || []) ||
    [];

  const handleDone = () => {
    if (selectedCourse && selectedTee) {
      onSelect?.({ course: selectedCourse, tee: selectedTee });
      navigation.goBack();
    }
  };

  return (
    <ScreenWrapper>
      <HeaderBar title="Select Course" />
      <CourseSearchBar
        onSelect={(course) => {
          setSelectedCourse(course);
          setSelectedTee(null); // clear tee when course changes
        }}
        onClearSelection={() => {
          setSelectedCourse(null);
          setSelectedTee(null);
        }}
      />

      {selectedCourse && (
        <>
          <Text style={styles.selectedText}>Tee Boxes:</Text>
          {allTees.map((tee, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.teeOption,
                tee === selectedTee && styles.teeSelected,
              ]}
              onPress={() => setSelectedTee(tee)}
            >
              <Text style={styles.teeName}>
                {tee.tee_name || `Tee ${i + 1}`}
              </Text>
              <Text style={styles.teeSubtext}>
                Rating: {tee.course_rating}, Slope: {tee.slope_rating}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <TouchableOpacity
        onPress={handleDone}
        disabled={!selectedCourse || !selectedTee}
        style={[
          styles.saveButton,
          !selectedCourse || !selectedTee ? { opacity: 0.5 } : {},
        ]}
      >
        <Text style={styles.saveText}>Done</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  selectedText: { marginTop: spacing.md, fontWeight: "600", marginBottom: spacing.sm },
  teeOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  teeSelected: {
    borderColor: colors.info,
    backgroundColor: colors.surfaceAlt,
  },
  teeName: { fontWeight: "600" },
  teeSubtext: { fontSize: 14, color: colors.textSecondary },
  saveButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    padding: spacing.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: colors.onAccent, fontWeight: "600" },
});
