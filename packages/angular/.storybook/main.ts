import { dirname } from 'path';
import { fileURLToPath } from 'url';
import type { StorybookConfig } from '@storybook/angular';

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

/**
 * `@storybook/angular` builds through the Angular CLI's webpack pipeline — it
 * has no Vite builder. The config used to name `@storybook/builder-vite` and
 * carry a `viteFinal` hook; neither ever ran, which also meant the
 * `@angular/animations` externalisation in that hook protected nothing (the
 * package is not installed and nothing imports it).
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-a11y'), getAbsolutePath('@storybook/addon-docs')],
  framework: {
    name: getAbsolutePath('@storybook/angular') as '@storybook/angular',
    options: {},
  },
  staticDirs: ['../../../public'],
  managerHead: (head) => `${head}<link rel="icon" href="/favicon.ico" />`,
};

export default config;
