/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,xml}",
    "./app/features/**/*.{xml,ts,tsx}",
    "./app/home-page.xml",
    "./src/components/**/*.{tsx,jsx,xml}",
  ],
  theme: {
    extend: {
      colors: {
        'figma-bg': '#1e1e1e',
        'figma-surface': '#2c2c2c',
        'figma-border': '#404040',
        'figma-text': '#ffffff',
        'figma-text-secondary': '#adadad',
        'figma-hover': '#3e3e3e',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}