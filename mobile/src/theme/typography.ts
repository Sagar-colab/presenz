import { Platform } from "react-native";

// Inter is the web design font. expo-font integration lands in Phase 5e; for
// now use the platform sans default which renders cleanly on both iOS and
// Android. When 5e wires custom fonts, point fontFamily to "Inter_*".
const sansFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

export const typography = {
  display: { fontFamily: sansFamily, fontSize: 28, fontWeight: "600" as const, letterSpacing: -0.4 },
  title: { fontFamily: sansFamily, fontSize: 22, fontWeight: "600" as const, letterSpacing: -0.3 },
  bodyLarge: { fontFamily: sansFamily, fontSize: 16, fontWeight: "400" as const },
  body: { fontFamily: sansFamily, fontSize: 14.5, fontWeight: "400" as const },
  small: { fontFamily: sansFamily, fontSize: 13, fontWeight: "400" as const },
  caps: {
    fontFamily: sansFamily,
    fontSize: 12,
    fontWeight: "500" as const,
    letterSpacing: 1.6,
    textTransform: "uppercase" as const,
  },
};
