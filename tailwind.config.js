/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { field: '#16834b' }, fontFamily: { sans: ['Inter', 'sans-serif'] } } },
  plugins: [],
}
