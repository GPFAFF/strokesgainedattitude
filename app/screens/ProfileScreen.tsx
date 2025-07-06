import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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

      await setDoc(
        doc(db, "users", user.uid),
        {
          handicap: handicap || null,
          email: email || user.email,
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      );

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
      <Text style={styles.header}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.staticText}>{user?.email}</Text>

        <Text style={styles.label}>Display Name</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          placeholder="Enter display name"
        />

        <Text style={styles.label}>Handicap</Text>
        <TextInput
          value={handicap}
          onChangeText={setHandicap}
          style={styles.input}
          placeholder="Enter handicap"
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, updating && styles.buttonDisabled]}
          onPress={handleUpdateProfile}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#F1F5F2",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D6A4F",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
    marginTop: 12,
  },
  staticText: {
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1B4332",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#6B7280",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
