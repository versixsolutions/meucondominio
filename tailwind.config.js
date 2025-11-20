import { versixTheme } from './src/config/theme-versix';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: versixTheme.colors.primary,
        secondary: versixTheme.colors.secondary,
        accent: versixTheme.colors.accent,
        brown: versixTheme.colors.brown,
      },
      fontFamily: versixTheme.typography.fontFamily,
    },
  },
  plugins: [],
};