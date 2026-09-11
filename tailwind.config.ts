import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#12161A",
        surface: "#1B2126",
        surface2: "#232A30",
        border: "#2E363D",
        text: "#ECEEF0",
        textDim: "#9AA4AC",
        accent: "#4FA8A0",
        accentStrong: "#6FC2B9",
        waiting: "#D4933D",
        success: "#7FBF8F",
        danger: "#C97066",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-spectral)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;