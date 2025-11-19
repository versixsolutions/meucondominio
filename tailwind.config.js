import { pinheiroParkTheme } from './src/config/theme-pinheiropark';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: pinheiroParkTheme.colors.primary,
        secondary: pinheiroParkTheme.colors.secondary,
        accent: pinheiroParkTheme.colors.accent,
        brown: pinheiroParkTheme.colors.brown,
      },
      fontFamily: pinheiroParkTheme.typography.fontFamily,
    },
  },
  plugins: [],
};