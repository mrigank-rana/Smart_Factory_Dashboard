/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        f: {
          bg:       "#e2e8f0",  // muted slick gray instead of bright white
          sidebar:  "#ffffff",  // bright white sidebar
          card:     "#ffffff",  // white cards
          border:   "#e2e8f0",  // light gray border
          muted:    "#8c9bbc",  // muted text
          text:     "#2a3342",  // very dark grey, almost black
          textMuted:"#6b7280",
          purple:   "#e6e6fa",  // pastel purple background
          purpleDark:"#7c3aed",
          blue:     "#e0ebff",  // pastel blue background
          blueDark: "#2563eb",
          pink:     "#fce7f3",  // pastel pink background
          pinkDark: "#db2777",
          green:    "#dcfce7",  // pastel green background
          greenDark:"#16a34a",
          amber:    "#fef3c7",
          amberDark:"#d97706",
          red:      "#fee2e2",
          redDark:  "#dc2626"
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out forwards",
        "fade-in": "fadeIn 0.2s ease-out",
        "pulse-dot": "pulseDot 1.5s infinite"
      },
      keyframes: {
        slideUp: {
          from: { transform: "translateY(12px)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        pulseDot: {
          "0%, 100%": { transform: "scale(1)", opacity: 1 },
          "50%": { transform: "scale(1.5)", opacity: 0.5 }
        }
      },
      boxShadow: {
        "card": "0 2px 10px rgba(0,0,0,0.03)",
        "card-hover": "0 6px 16px rgba(0,0,0,0.06)",
        "sidebar": "2px 0 12px rgba(0,0,0,0.02)"
      },
    },
  },
  plugins: [],
};
