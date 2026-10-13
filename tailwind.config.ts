import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFCF6",
          100: "#FBF5E9",
          200: "#F4E9D2",
          300: "#E9D6B3",
        },
        chai: {
          50: "#FBF1E8",
          100: "#F3DCC4",
          200: "#E3B88B",
          300: "#CE9158",
          400: "#B46F33",
          500: "#8F5222",
          600: "#6F3F1B",
          700: "#563016",
          800: "#3E2310",
          900: "#2A180B",
        },
        saffron: {
          50: "#FFF4E8",
          100: "#FFE2C2",
          200: "#FFC88A",
          300: "#FFAA52",
          400: "#F78C26",
          500: "#E3730E",
          600: "#BF5A08",
          700: "#98450A",
        },
        charcoal: {
          50: "#F5F4F3",
          100: "#E6E3E0",
          200: "#C9C4BF",
          300: "#A19A94",
          400: "#7A726C",
          500: "#5A534E",
          600: "#423C38",
          700: "#322D2A",
          800: "#25211F",
          900: "#181615",
        },
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(62,35,16,0.05), 0 4px 16px -4px rgba(62,35,16,0.08)",
        pop: "0 20px 50px -12px rgba(42,24,11,0.35)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
        "slide-in-right": "slide-in-right 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
