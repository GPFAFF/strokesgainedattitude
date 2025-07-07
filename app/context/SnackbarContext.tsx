import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar } from "react-native-paper";
import { View, StyleSheet } from "react-native";

type SnackbarType = "success" | "error";

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context)
    throw new Error("useSnackbar must be used within SnackbarProvider");
  return context.showSnackbar;
};

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<SnackbarType>("success");

  const showSnackbar = useCallback(
    (msg: string, t: SnackbarType = "success") => {
      setMessage(msg);
      setType(t);
      setVisible(true);
    },
    []
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        theme={{
          colors: {
            onSurface: type === "error" ? "#fff" : "#000",
          },
        }}
        style={[
          styles.snackbar,

          type === "error" ? styles.error : styles.success,
        ]}
      >
        {message || "⚠️ Empty message?"}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  success: {
    backgroundColor: "#16A34A", // Green
  },
  error: {
    backgroundColor: "#DC2626",
  },
});
