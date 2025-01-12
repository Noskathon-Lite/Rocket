/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        title: ['Rubik Distressed', 'serif'],
        paragraph: ["Jersey 15", 'serif'],
      },
      backgroundColor: {
        'gray-100': '#f3f4f6',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}

