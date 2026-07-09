/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#4263eb',
          800: '#3b5bdb',
          900: '#364fc7',
        },
        neon: {
          pink: '#ff6b9d',
          purple: '#c44dff',
          blue: '#4dc9f6',
          green: '#51cf66',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(92, 124, 250, 0.5), 0 0 20px rgba(92, 124, 250, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(92, 124, 250, 0.8), 0 0 40px rgba(92, 124, 250, 0.4)' },
        },
      },
    },
  },
  plugins: [],
}
