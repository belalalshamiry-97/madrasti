import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        foreground: "#F8FAFC",
        surface: {
          DEFAULT: "#1E293B",
          secondary: "#243449",
          hover: "#2A3B52",
        },
        brand: {
          cyan: "#38BDF8",
          blue: "#0EA5E9",
          teal: "#2CB6A3",
        },
        status: {
          success: "#2CB6A3",
          warning: "#F59E0B",
          danger: "#EF4444",
          info: "#38BDF8",
        },
        muted: {
          DEFAULT: "#94A3B8",
          foreground: "#64748B",
        },
        border: "#243449",
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        tajawal: ["var(--font-tajawal)", "Tajawal", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        glow: "0 0 20px -5px rgba(56, 189, 248, 0.25)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
