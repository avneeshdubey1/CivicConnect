/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(214.3 31.8% 91.4%)",
        background: "#f8fafc",
        foreground: "#0f172a",
        primary: {
          DEFAULT: "#059669",
          foreground: "#ffffff",
        },
      },
    },
  },
  plugins: [],
}