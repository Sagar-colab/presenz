// Mirrors the web app's design tokens. Keep in sync with tailwind.config.ts +
// CSS variables in apps/<root>/globals.css. Single source of truth lives on
// the web side; values here are duplicated by design (no shared package yet).

export const colors = {
  primary: "#534AB7",
  primary600: "#453E9C",
  surface: "#FFFFFF",
  surfaceAlt: "#F6F5F2",
  surfaceLine: "#E7E4DD",
  ink: "#1A1815",
  inkSoft: "#3D3A35",
  inkMuted: "#75716A",
  inkFaint: "#A8A39A",
  danger: "#C2453A",
  success: "#3B7A4F",
  warning: "#B5731F",
} as const;
