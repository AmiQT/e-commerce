/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stylehub': {
          primary: '#ea2a33',
          secondary: '#994d51',
          dark: '#1b0e0e',
          light: '#fcf8f8',
          border: '#f3e7e8',
        }
      }
    },
  },
  plugins: [],
}
