import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // The Hub doesn't need its own stories, it just hosts the others
  stories: ['../src/**/*.mdx'],

  addons: [getAbsolutePath("@storybook/addon-links"), getAbsolutePath("@storybook/addon-docs")],

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  // This is the heart of the Composition Hub
  refs: {
    react: {
      title: 'React Library',
      url: 'http://localhost:6006',
      // Optional: expand the tree by default
      expanded: true,
    },
    angular: {
      title: 'Angular Library',
      url: 'http://localhost:6007',
      expanded: true,
    },
  },

  features: {
    backgrounds: false,
    outline: false
  }
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
