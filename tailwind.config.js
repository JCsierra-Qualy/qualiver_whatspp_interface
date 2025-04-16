/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3752E1',
        secondary: '#00C49A',
        'gray-light': '#F4F5F7',
        'gray-dark': '#1F1F1F',
        'pure-black': '#000000',
      },
    },
  },
  plugins: [],
} 