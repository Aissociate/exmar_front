/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: '#07111f',
          mid: '#0c1a2e',
          card: '#111f35',
          border: '#1e3050',
        },
        gold: {
          DEFAULT: '#c9971f',
          light: '#e6b84a',
        },
        muted: '#7a9bbf',
      },
      fontFamily: {
        bebas: ['Bebas Neue', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
