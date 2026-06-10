/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fifa: {
          blue: '#003087',
          gold: '#FFD700',
          red: '#DA291C',
        }
      }
    },
  },
  plugins: [],
}
