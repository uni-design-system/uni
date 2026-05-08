import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // The Hub doesn't need its own stories, it just hosts the others
  stories: ["../src/**/*.mdx"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-docs"
  ],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  // This is the heart of the Composition Hub
  refs: {
    react: {
      title: "React Library",
      url: "http://localhost:6006",
      // Optional: expand the tree by default
      expanded: true,
    },
    angular: {
      title: "Angular Library",
      url: "http://localhost:6007",
      expanded: true,
    },
  },

  docs: {
    autodocs: "tag",
  },
};

export default config;
