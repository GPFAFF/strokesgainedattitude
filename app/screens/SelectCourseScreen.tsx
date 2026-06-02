import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import CourseSearchBar from "../components/CourseSearch";
import { colors } from "../theme";
import { Course, RootStackParamList, Tee } from "../lib/types";

export default function SelectCourseScreen() {
  const route = useRoute<RouteProp<RootStackParamList>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const onSelect = (route.params as RootStackParamList["AddCourse"])?.onSelect;

  const handleSelect = (course: Course, tee: Tee) => {
    onSelect?.({ course, tee });
    navigation.goBack();
  };

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTee, setSelectedTee] = useState<Tee | null>(null);

  const allTees =
    selectedCourse?.tees?.male?.concat(selectedCourse?.tees?.female || []) ||
    [];

  const openAddCourse = (query?: string) => {
    navigation.navigate("AddCourse", {
      defaultName: query,
      onSelect: (course: any) => {
        setSelectedCourse(course);
      },
    });
  };

  const handleDone = () => {
    if (selectedCourse && selectedTee) {
      onSelect?.({ course: selectedCourse, tee: selectedTee });
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Search Course</Text>

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
              onPress={() => {
                setSelectedTee(tee);
                handleSelect(selectedCourse, tee);
              }}
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
      <TouchableOpacity onPress={() => openAddCourse()}>
        <Text style={styles.addCourseText}>Can't find it? Add your course</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  selectedText: { marginTop: 16, fontWeight: "600", marginBottom: 8 },
  teeOption: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  teeSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#EAF4FF",
  },
  teeName: { fontWeight: "600" },
  teeSubtext: { fontSize: 14, color: "#555" },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.sunsetCoral,
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "white", fontWeight: "600" },
  addCourseText: {
    color: colors.forestGreen,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "500",
  },
});
