
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3b82f6',
          dark: '#1e40af'
        }
      },
      borderRadius: {
        '2xl': '1rem'
      },
      boxShadow: {
        soft: '0 10px 25px -10px rgba(0,0,0,0.25)'
      }
    }
  },
  plugins: []
}
