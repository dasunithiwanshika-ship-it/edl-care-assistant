import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          maroon: "#7A1428",
          darkMaroon: "#5C0D1D",
          lightMaroon: "#9E1B34",
          gold: "#F5C518",
          goldHover: "#E0B310",
        },
        surface: {
          bg: "#F5F6F8",
          card: "#FFFFFF",
          textPrimary: "#1A1D20",
          textSecondary: "#687078",
          darkBg: "#0F1216",
          darkCard: "#191E24",
          darkBorder: "#27313B",
        },
      },
      boxShadow: {
        subtle: "0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px -2px rgba(122, 20, 40, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        cardHover: "0 10px 25px -4px rgba(122, 20, 40, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)",
        dropdown: "0 10px 30px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
