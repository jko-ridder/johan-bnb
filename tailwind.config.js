/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/pages/**/*.{js,ts,jsx,tsx}', // Include all files in the pages directory
    './src/components/**/*.{js,ts,jsx,tsx}', // Include all files in the components directory
    './src/app/**/*.{js,ts,jsx,tsx}', // Include all files in the app directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};