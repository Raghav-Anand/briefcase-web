/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Dark-first design. To add light mode, switch to 'class' and add dark: variants.
  darkMode: 'media',
  theme: {
    extend: {
      // ── Theme tokens ──────────────────────────────────────────────────────────
      // Change the brand palette here to retheme the entire app.
      // Currently: indigo. Swap for 'violet', 'sky', 'emerald', etc.
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      // Remove the auto-inserted backtick characters @tailwindcss/typography
      // injects around inline <code> via ::before / ::after pseudo-elements.
      typography: {
        DEFAULT: {
          css: {
            'code::before': { content: 'none' },
            'code::after':  { content: 'none' },
          },
        },
      },
      // ─────────────────────────────────────────────────────────────────────────
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
