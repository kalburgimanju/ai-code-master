import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { primary: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' }, dark: { 50: '#C1C2C5', 100: '#A6A7AB', 200: '#909296', 300: '#5C5F66', 400: '#373A40', 500: '#2C2E33', 600: '#25262B', 700: '#1A1B1E', 800: '#141517', 900: '#101113' }, } } },
  plugins: [],
} satisfies Config;
