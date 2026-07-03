import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
        dark: { 50: '#C1C2C5', 100: '#A6A7AB', 200: '#909296', 300: '#5C5F66', 400: '#373A40', 500: '#2C2E33', 600: '#25262B', 700: '#1A1B1E', 800: '#141517', 900: '#101113' },
      },
    },
  },
  plugins: [],
};
export default config;
