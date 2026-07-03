/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sanskrit: {
          50: '#fef3c6',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#ca8a04',
          700: '#a16207',
          800: '#78350f',
          900: '#451a03',
        },
        sanskritBlue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#172559',
        }
      },
      fontFamily: {
        sanskrit: ['"Noto Sans Devanagari"', 'sans-serif'],
        english: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}