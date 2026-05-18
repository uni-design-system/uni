import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { mergeConfig } from 'vite';
import type { StorybookConfig as StorybookConfigBase } from '@storybook/angular';
import type { StorybookConfigVite } from '@storybook/builder-vite';

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

type StorybookConfig = StorybookConfigBase & StorybookConfigVite;

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-a11y'), getAbsolutePath('@storybook/addon-docs')],
  framework: {
    name: getAbsolutePath('@storybook/angular') as '@storybook/angular',
    options: {
      builder: {
        name: getAbsolutePath('@storybook/builder-vite') as '@storybook/builder-vite',
        options: {},
      },
    },
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
