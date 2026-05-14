import type { StorybookConfig } from '@analogjs/storybook-angular';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { mergeConfig } from 'vite';

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-a11y'), getAbsolutePath('@storybook/addon-docs')],
  framework: {
    // Switch this to the Analog framework to fix the 'undefined' error
    name: getAbsolutePath('@analogjs/storybook-angular'),
    options: {},
  },
  staticDirs: ['../../../public'],
  managerHead: (head) => `${head}<link rel="icon" href="/favicon.ico" />`,
  async viteFinal(config) {
    return mergeConfig(config, {
      optimizeDeps: {
        exclude: ['@angular/animations', '@angular/animations/browser'],
      },
      build: {
        rollupOptions: {
          external: ['@angular/animations', '@angular/animations/browser'],
        },
      },
    });
  },
};

export default config;
