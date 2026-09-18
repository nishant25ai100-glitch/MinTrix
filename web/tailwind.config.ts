import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        mine: {
          950: "#070A10",
          900: "#0B0F17",
          850: "#0F1524",
          800: "#161F32",
          750: "#1B273F",
          700: "#22314E",
          600: "#2D4268",
          border: "#1E2C44",
        },
        ore: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          glow: "rgba(245, 158, 11, 0.25)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
