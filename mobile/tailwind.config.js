/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#045bbd',
          dark: '#053577',
          light: '#08a4f8',
        },
        accent: {
          DEFAULT: '#f2ad9e',
        },
        navy: {
          DEFAULT: '#041434',
        }
      }
    },
  },
  plugins: [],
}
