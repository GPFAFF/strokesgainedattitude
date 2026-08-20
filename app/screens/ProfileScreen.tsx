import React from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { useSnackbar } from "../context/SnackbarContext";

import { useAuth } from "../hooks/auth";
import HeaderBar from "../components/HeaderBar";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUpdateUserProfile } from "../hooks/useUpdateUser";
import useUserProfileForm from "../hooks/useUserProfileForm";
import { logout } from "../services/authService";
import { useDeleteAccount } from "../hooks/useDeleteAccount";

const ProfileScreen = () => {
  const { user: authUser, userId, authLoading } = useAuth();
  const { data: userProfile, isLoading: profileLoading } =
    useUserProfile(userId);

  const user =
    authUser && userProfile ? { ...authUser, ...userProfile } : null;
  const loading = authLoading || profileLoading;

  const { deleteAccount, deleting } = useDeleteAccount();

  const { displayName, setDisplayName, email, handicap, setHandicap } =
    useUserProfileForm(user);

  const { handleUpdateProfile, updating } = useUpdateUserProfile();

  const showSnackbar = useSnackbar();

  const onSubmit = async () => {
    await handleUpdateProfile({ displayName, handicap });
  };

  // Signing out clears the session; the root navigator swaps back to the auth
  // stack on its own, so there is no screen to navigate to here.
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      showSnackbar((err as Error).message, "error");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteAccount,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScreenWrapper loading={loading}>
      <HeaderBar title="Profile" />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.staticText}>{email}</Text>

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
          onPress={onSubmit}
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
          style={[styles.deleteButton, deleting && styles.buttonDisabled]}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          <Text style={styles.deleteText}>
            {deleting ? "Deleting…" : "Delete Account"}
          </Text>
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
  },
  card: {
    backgroundColor: "#F1F5F2",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 8,
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
