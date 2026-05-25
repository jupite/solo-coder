/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        storm: {
          night: "#0b1026",
          deep: "#131a3b",
          cyan: "#4cc9f0",
          amber: "#ffb547",
          red: "#ff4d6d",
          sky: "#8ecae6",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        sans: ["Noto Sans SC", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 32px rgba(76,201,240,0.35), 0 0 64px rgba(255,181,71,0.18)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        floaty: "floaty 3s ease-in-out infinite",
        shimmer: "shimmer 6s ease-in-out infinite",
        pulseRing: "pulseRing 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};
