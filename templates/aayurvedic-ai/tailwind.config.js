/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ayurvedic: {
          50: "#FFF7ED",
          100: "#FFECD6",
          200: "#FFC9A5",
          300: "#FFB475",
          400: "#FF9D41",
          500: "#FF8100",
          600: "#E66E00",
          700: "#CC5A00",
          800: "#A34700",
          900: "#7A3300",
        },
      },
    },
  },
  plugins: [],
};