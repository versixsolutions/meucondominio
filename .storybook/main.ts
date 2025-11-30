import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-viewport",
    "@storybook/addon-themes",
    "@storybook/addon-vitest"
  ],
  "framework": "@storybook/react-vite",
  "docs": {
    autodocs: 'tag'
  }
};
export default config;