/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // MediKiosk design tokens — see docs/design-notes.md
        canvas: "#F7F8F6",
        surface: "#FFFFFF",
        ink: "#16323A",
        muted: "#5B6B6A",
        border: "#E2E5E0",
        primary: {
          DEFAULT: "#0F5C55",
          dark: "#0B453F",
          light: "#E4F0EE",
        },
        accent: {
          DEFAULT: "#E08E1D",
          dark: "#B8730F",
          light: "#FBECD3",
        },
        alert: {
          DEFAULT: "#C1432D",
          light: "#FBE7E2",
        },
        success: {
          DEFAULT: "#2F8F5B",
          light: "#E4F3EA",
        },
      },
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        kiosk: "1.25rem",
      },
      boxShadow: {
        kiosk: "0 1px 2px rgba(22,50,58,0.04), 0 8px 24px rgba(22,50,58,0.06)",
      },
    },
  },
  plugins: [],
};
