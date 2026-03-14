/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px -20px rgba(15, 23, 42, 0.35)",
      },
      colors: {
        brand: {
          50: "#f4f7ec",
          100: "#e7efd3",
          200: "#cedfa6",
          300: "#afca73",
          400: "#92b34b",
          500: "#789438",
          600: "#5d742b",
          700: "#485823",
          800: "#3d4922",
          900: "#343d20"
        }
      }
    },
  },
  plugins: [],
};
