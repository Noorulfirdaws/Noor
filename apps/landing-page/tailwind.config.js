/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#f97316',
        'brand-dark': '#ea580c',
        dark: '#0f172a',
        mid: '#1e293b',
      },
    },
  },
  plugins: [],
}

