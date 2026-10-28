/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eci: {
          saffron: '#FF9933',
          'saffron-dark': '#E67300',
          green: '#138808',
          'green-dark': '#0E6606',
          navy: '#082545',
          'navy-dark': '#04162B',
          'navy-light': '#0E3B6E',
          ashoka: '#000080',
          cream: '#FFFDF9',
          gold: '#D4AF37',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      }
    },
  },
  plugins: [],
}

