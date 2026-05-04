import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#534AB7",
          50: "#F4F3FB",
          100: "#E6E4F4",
          200: "#C8C4E6",
          300: "#A29CD3",
          400: "#7C73C5",
          500: "#534AB7",
          600: "#453E9C",
          700: "#383281",
          800: "#2B2666",
          900: "#1F1B4B",
        },
        ink: {
          DEFAULT: "#0F0F14",
          soft: "#3A3A44",
          muted: "#6B6B78",
          faint: "#A8A8B3",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#FAFAFB",
          line: "#ECECEF",
        },
        success: "#1F8A4C",
        warning: "#B36B00",
        danger: "#B3261E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      borderWidth: {
        hair: "0.5px",
      },
      letterSpacing: {
        tightish: "-0.012em",
      },
      maxWidth: {
        prose: "62ch",
      },
    },
  },
  plugins: [],
};

export default config;
