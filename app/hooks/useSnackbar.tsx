import React, { createContext, useContext, useState } from "react";
import { Snackbar } from "react-native-paper";

const SnackbarContext = createContext<any>(null);

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
      <Snackbar
        theme={{
          colors: {
            accent: "#1B4332", // Dark green
            background: "#F0F4F8", // Light background
            text: "#FFFFFF", // White text
          },
        }}
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setVisible(false),
        }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
