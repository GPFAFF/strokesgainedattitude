import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { getAuth, updateProfile, signOut, deleteUser } from "firebase/auth";
import ScreenWrapper from "../components/ScreenWrapper";
import { useSnackbar } from "../hooks/useSnackbar";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const ProfileScreen = ({ navigation }: any) => {
  const auth = getAuth();
  const user = auth.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [handicap, setHandicap] = useState(user?.handicap?.toString() || "");
  const [updating, setUpdating] = useState(false);
  const showSnackbar = useSnackbar();

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      await updateProfile(user, { displayName });

      if (email !== user.email || handicap !== user?.handicap) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            handicap: handicap || null,
            email: email || user.email,
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );
      }

      showSnackbar("Profile updated successfully", "success");
    } catch (err) {
      showSnackbar("Error", (err as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  const handleDeleteAccount = async () => {
    showSnackbar("Delete Account", "Are you sure? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(user);
            showSnackbar("Deleted", "Your account has been deleted.");
            navigation.replace("Signup");
          } catch (err) {
            showSnackbar("Error", (err as Error).message);
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.text}>{user?.email}</Text>

        <Text style={styles.label}>Display Name:</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          placeholder="Enter display name"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholder="Enter email"
        />
        <TextInput
          value={handicap}
          onChangeText={setHandicap}
          style={styles.input}
          placeholder="Enter handicap"
          keyboardType="numeric"
        />

        <Button
          title="Update Profile"
          onPress={handleUpdateProfile}
          disabled={updating}
        />
        <View style={styles.space} />
        <Button title="Logout" onPress={handleLogout} color="#B91C1C" />
        <View style={styles.space} />
        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
          color="#991B1B"
        />
      </View>
    </ScreenWrapper>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 4,
    color: "#2D6A4F",
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
  },
  space: {
    height: 16,
  },
});
