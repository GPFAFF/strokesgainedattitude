import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";

import { useSaveCustomCourse } from "../hooks/useSaveCustomCourse";
import { colors, spacing } from "../theme";
import { AddCourseScreenRouteParams } from "../lib/types";

export default function AddCourseScreen() {
  const route =
    useRoute<RouteProp<{ params: AddCourseScreenRouteParams }, "params">>();
  const navigation = useNavigation();
  const { defaultName, onSelect } = route.params || {};
  const { mutateAsync: saveCourse } = useSaveCustomCourse();

  const [name, setName] = useState(defaultName || "");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [tees, setTees] = useState("");
  const [rating, setRating] = useState("");
  const [slope, setSlope] = useState("");

  const handleSave = async () => {
    if (!name || !tees || !rating || !slope || !city || !state) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    const course = await saveCourse({
      name,
      city,
      state,
      tees: [
        {
          course_rating: rating,
          slope_rating: slope,
          tee_name: tees,
        },
      ],
    });

    onSelect?.(course);
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Course Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Tees"
        value={tees}
        onChangeText={setTees}
        style={styles.input}
      />
      <TextInput
        placeholder="Rating"
        value={rating}
        onChangeText={setRating}
        style={styles.input}
      />
      <TextInput
        placeholder="Slope"
        value={slope}
        onChangeText={setSlope}
        style={styles.input}
      />
      <TextInput
        placeholder="City"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />
      <TextInput
        placeholder="State"
        value={state}
        onChangeText={setState}
        style={styles.input}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Add Round</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 8,
    padding: 10,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: colors.sunsetCoral,
    padding: spacing.md,
    borderRadius: spacing.sm,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  saveText: {
    color: colors.white,
    fontSize: spacing.md,
    fontWeight: "600",
  },
});
