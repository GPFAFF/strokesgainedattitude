import { Snackbar } from "react-native-paper";
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

const SnackbarComponent = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <View>
      <Snackbar
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
    </View>
  );
};

const styles = StyleSheet.create({
  // Add your styles here
});

export default SnackbarComponent;
