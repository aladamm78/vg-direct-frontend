/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all JS/TS/JSX/TSX files in the `src` directory
    "./public/index.html",        // Include the main HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
