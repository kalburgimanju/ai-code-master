import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdaff',
          300: '#8ec2ff',
          400: '#599fff',
          500: '#3478f6',
          600: '#1f5ae0',
          700: '#1a47b8',
          800: '#1b3d93',
          900: '#1c3774',
        },
        ink: {
          50: '#f5f6f8',
          100: '#e6e8ec',
          200: '#c9cdd6',
          300: '#9aa1b1',
          400: '#6b7280',
          500: '#4b5563',
          600: '#374151',
          700: '#1f2430',
          800: '#15181f',
          900: '#0c0e13',
          950: '#07080c',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
