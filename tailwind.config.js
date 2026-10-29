/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Courthouse dark / crimson aesthetic
        court: {
          bg:        "#0d0d0d",
          surface:   "#141414",
          border:    "#2a1505",
          accent:    "#3d1a00",
          gold:      "#c9a84c",
          "gold-lt": "#e8c96c",
          green:     "#00c853",
          red:       "#8B0000",
          "red-lt":  "#ef4444",
          crimson:   "#DC143C",
          amber:     "#ffab00",
          text:      "#f5f0e8",
          "text-dim":"#8a7a6a",
          blue:      "#1565c0",
          "blue-lt": "#42a5f5",
        },
        // Top-level aliases
        parchment:     "#f5f0e8",
        "night-black": "#0d0d0d",
      },
      fontFamily: {
        judicial: ["'Playfair Display'", "Georgia", "serif"],
        mono:     ["'JetBrains Mono'", "'Courier New'", "monospace"],
        sans:     ["'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-gold":  "pulseGold 2s ease-in-out infinite",
        "seal-stamp":  "sealStamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "shake-alert": "shakeAlert 0.5s ease-in-out",
        "typewriter":  "typewriter 0.05s steps(1) forwards",
        "glow-green":  "glowGreen 1.5s ease-in-out infinite",
        "glow-red":    "glowRed 1s ease-in-out infinite",
        "float":       "float 3s ease-in-out infinite",
        "scan-line":   "scanLine 2s linear infinite",
        "fade-in":     "fadeIn 0.5s ease-out forwards",
        "slide-up":    "slideUp 0.4s ease-out forwards",
        "count-up":    "countUp 0.5s ease-out forwards",
        "flash-new":   "flashNew 1.5s ease-out forwards",
      },
      keyframes: {
        pulseGold: {
          "0%, 100%": { opacity: "1",   boxShadow: "0 0 8px #c9a84c40" },
          "50%":      { opacity: "0.7", boxShadow: "0 0 20px #c9a84c80" },
        },
        sealStamp: {
          "0%":   { transform: "scale(2) rotate(-10deg)", opacity: "0" },
          "60%":  { transform: "scale(0.95) rotate(2deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        shakeAlert: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":      { transform: "translateX(-8px)" },
          "40%":      { transform: "translateX(8px)" },
          "60%":      { transform: "translateX(-5px)" },
          "80%":      { transform: "translateX(5px)" },
        },
        glowGreen: {
          "0%, 100%": { boxShadow: "0 0 5px #00c85340" },
          "50%":      { boxShadow: "0 0 20px #00c85380, 0 0 40px #00c85320" },
        },
        glowRed: {
          "0%, 100%": { boxShadow: "0 0 5px #8B000040" },
          "50%":      { boxShadow: "0 0 20px #8B000080, 0 0 40px #8B000020" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        scanLine: {
          "0%":   { backgroundPosition: "0 -100%" },
          "100%": { backgroundPosition: "0 200%" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        countUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        flashNew: {
          "0%":   { backgroundColor: "rgba(201,168,76,0.3)" },
          "100%": { backgroundColor: "transparent" },
        },
      },
      backgroundImage: {
        "court-pattern": "radial-gradient(ellipse at center, #3d1a0015 0%, transparent 70%)",
        "gold-gradient":  "linear-gradient(135deg, #c9a84c, #e8c96c, #c9a84c)",
        "red-gradient":   "linear-gradient(135deg, #8B0000, #DC143C, #8B0000)",
        "judicial-grid":  "linear-gradient(rgba(42,21,5,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(42,21,5,0.3) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
