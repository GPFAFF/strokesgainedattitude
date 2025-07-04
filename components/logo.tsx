import { View, Image, StyleSheet } from "react-native";
import React from "react";

const Logo = () => {
  return (
    <View>
      <Image style={styles.tinyLogo} source={require("../assets/logo.png")} />
    </View>
  );
};

const styles = StyleSheet.create({
  tinyLogo: {
    width: 300,
    height: 300,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 8,
  },
});

export default Logo;
