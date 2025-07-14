import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export default function AddCourseScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { defaultName, onSelect } = route.params || {};

  const [name, setName] = useState(defaultName || "");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [tees, setTees] = useState("");
  const [rating, setRating] = useState("");
  const [slope, setSlope] = useState("");

  const handleSave = async () => {
    const newCourse = {
      name,
      city,
      state,
      tees: {
        male: [
          {
            course_rating: rating,
            slope_rating: slope,
            tee_name: tees,
          },
        ],
      },
      createdAt: serverTimestamp(),
      isCustom: true,
    };
    const docRef = await addDoc(collection(db, "courses"), newCourse);
    onSelect?.({ ...newCourse, id: docRef.id, tees: {} });
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
      <Button title="Save Course" onPress={handleSave} />
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
});
