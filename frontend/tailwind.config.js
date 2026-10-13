/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#E87924',
          50: '#FDF5EC',
          100: '#FBEAD9',
          500: '#E87924',
          600: '#D26312',
          700: '#B04B0A',
        },
        maroon: {
          DEFAULT: '#852D36',
          50: '#F9F1F2',
          100: '#F3E3E5',
          500: '#852D36',
          600: '#6F222A',
          700: '#5A1920',
        },
        gold: {
          DEFAULT: '#D9AA55',
          50: '#FDFBEE',
          100: '#FBF5D5',
          500: '#D9AA55',
          600: '#C2913A',
          700: '#A47525',
        },
        cream: {
          DEFAULT: '#FFF6E9',
          100: '#FFF9F0',
          200: '#FFF6E9',
          300: '#FCEFD8',
        }
      },
      fontFamily: {
        hindi: ['Mukta', 'sans-serif'],
        heading: ['"Tiro Devanagari Hindi"', 'serif'],
      }
    },
  },
  plugins: [],
}
