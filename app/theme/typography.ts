import type { TextStyle } from "react-native";

/**
 * Shared type scale. Spread a token into a style rather than restating sizes:
 *
 *   const styles = StyleSheet.create({ title: { ...typography.h2 } });
 */
export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: "700", letterSpacing: -0.5 },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: "700", letterSpacing: -0.3 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "400" },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: "600" },
  label: { fontSize: 13, lineHeight: 18, fontWeight: "500", letterSpacing: 0.3 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" },
} satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
