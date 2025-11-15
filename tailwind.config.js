/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
      '2.5xl': '1.7rem', // antara 2xl dan 3xl
      },
      colors: {
        yellowCustom : "#FFCA75",
        dashboardStart: '#150412',
        dashboardMid: '#7e1e75',
        dashboardEnd: '#a61e8f',
        ungu : "#7e1e75",
        cardBackgroundColor: '#fefdfe', // 🌤 mode terang
        cardBackgroundColorDark: '#1a1a1a', // 🌙 mode gelap
      },
    },
  },
  plugins: [],
};