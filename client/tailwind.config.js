/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // ตั้งค่าให้ฟอนต์ sans หลักของเว็บ เป็น Kanit
        sans: ["var(--font-kanit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};