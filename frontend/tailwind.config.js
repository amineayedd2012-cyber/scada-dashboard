/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          '900': '#0f172a',
          '800': '#1e293b',
          '700': '#334155',
        }
      },
      animation: {
        blob: 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': 'transform: translate(0, 0) scale(1)',
          '33%': 'transform: translate(30px, -50px) scale(1.1)',
          '66%': 'transform: translate(-20px, 20px) scale(0.9)',
        },
      },
    },
  },
  plugins: [],
}
