/**
 * The six brand colors. Prefer the semantic `colors` tokens below in UI code —
 * reach for `brand` only when you specifically mean "the brand green", etc.
 */
export const brand = {
  green: "#86C14B",
  greenDark: "#3B5634",
  red: "#F03838",
  sand: "#E0C097",
  aqua: "#81D4FA",
  orange: "#FF7043",
};

/**
 * Semantic theme tokens. UI code should reference these rather than raw hex
 * values or brand names, so a palette change stays a one-file edit.
 */
const semanticColors = {
  // Brand-derived roles
  primary: brand.green,
  primaryDark: brand.greenDark,
  accent: brand.orange,
  info: brand.aqua,
  sand: brand.sand,
  danger: brand.red,
  success: brand.green,

  // Surfaces
  bg: "#FFFFFF",
  surface: "#F7F8F5",
  surfaceAlt: "#EDEFE9",

  // Text / on-color
  textPrimary: "#1C2118",
  textSecondary: "#4A5344",
  textMuted: "#8A927F",
  onPrimary: "#FFFFFF",
  onAccent: "#FFFFFF",

  // Lines
  border: "#E2E5DC",
  borderStrong: "#C7CCBD",

  /**
   * Rating scale for 1–5 ratings, worst → best. Index with `score - 1`.
   */
  scale: ["#F03838", "#FF7043", "#E0C097", "#9CCB6B", "#3B5634"] as string[],
};

/**
 * DEPRECATED color names, kept so screens written against the old flat palette
 * keep compiling. Each maps to the nearest new token. Migrate call sites to the
 * semantic tokens above, then delete this block.
 *
 * @deprecated Use the semantic tokens instead.
 */
const legacyColors = {
  darkGreen: semanticColors.primaryDark,
  green: semanticColors.surface,
  fairwayGreen: semanticColors.primary,
  forestGreen: semanticColors.primary,
  bunkerSand: semanticColors.sand,
  sunsetCoral: semanticColors.accent,
  skyBlue: semanticColors.info,
  deepSky: semanticColors.info,
  red: semanticColors.danger,
  white: semanticColors.bg,
  pureWhite: semanticColors.bg,
  softWhite: semanticColors.surface,
  whiteSmoke: semanticColors.surface,
  warmTaupe: semanticColors.surfaceAlt,
  charcoal: semanticColors.textPrimary,
  deepNavy: semanticColors.textPrimary,
  coolGray: semanticColors.textMuted,
  lightGray: semanticColors.surfaceAlt,
  mistGray: semanticColors.border,
  duskGray: semanticColors.textSecondary,
  oliveLeaf: semanticColors.primary,
  turfGreen: semanticColors.primary,
};

export type Colors = typeof semanticColors & typeof legacyColors;

export const colors: Colors = Object.assign(semanticColors, legacyColors);
