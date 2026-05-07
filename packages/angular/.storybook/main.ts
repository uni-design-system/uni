import type { StorybookConfig } from '@analogjs/storybook-angular';
import { dirname } from "path"
import { fileURLToPath } from "url"

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs')
  ],
  "framework": {
    // Switch this to the Analog framework to fix the 'undefined' error
    name: getAbsolutePath('@analogjs/storybook-angular'),
    options: {}
  }
};

export default config;
