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
import { colors, spacing } from "../theme";

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
            <ActivityIndicator color={colors.onPrimary} />
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
    color: colors.primaryDark,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    width: "100%",
    marginBottom: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primaryDark,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  staticText: {
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: 8,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primaryDark,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: colors.textMuted,
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  logoutText: {
    color: colors.onAccent,
    fontSize: 16,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: spacing.md,
  },
  deleteText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "500",
  },
});
