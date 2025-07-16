import { Snackbar } from "react-native-paper";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

type SnackbarType = "success" | "error";

const SnackbarComponent = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<SnackbarType>("success");

  const showSnackbar = (msg: string, type: SnackbarType = "success") => {
    setMessage(msg);
    setType(type);
    setVisible(true);
  };

  return (
    <View>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          type === "success" ? styles.success : styles.error,
        ]}
        theme={{
          colors: {
            onSurface: type === "error" ? "#fff" : "#1B4332",
            surface: "transparent",
          },
        }}
      >
        {message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    borderRadius: 12,
    margin: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  success: {
    backgroundColor: "#F1F5F2",
  },
  error: {
    backgroundColor: "#DC2626",
  },
});

export default SnackbarComponent;
