/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Dark-first design. To add light mode, switch to 'class' and add dark: variants.
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      // ── Theme tokens ──────────────────────────────────────────────────────────
      // Change the brand palette here to retheme the entire app.
      // Currently: indigo. Swap for 'violet', 'sky', 'emerald', etc.
      colors: {
        // Warm amber-cognac — Claude-inspired warmth, distinct identity
        brand: {
          50:  '#fef8ee',
          100: '#fdefd3',
          200: '#fadba6',
          300: '#f6bf6e',
          400: '#f09c35',
          500: '#e8821a',  // primary — rich amber
          600: '#d96710',
          700: '#b44e10',
          800: '#903d14',
          900: '#763314',
          950: '#401808',
        },
        // Warm dark browns — lighter and warmer than slate
        ink: {
          950: '#100d09',  // sidebar (deepest)
          900: '#1c1610',  // page background
          800: '#261e14',  // card / panel background
          700: '#33271a',  // card hover / elevated
          600: '#443319',  // border
          500: '#5c4826',  // muted border
          400: '#7a6240',  // subtle text / icons
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
