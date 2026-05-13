import { addons } from 'storybook/manager-api';
import { create } from "storybook/theming";

const theme = create({
  base: 'light',
  brandTitle: 'UNI Design System',
  brandUrl: 'https://uni-design-system.github.io/uni/docs/angular',
  brandImage: 'uni-storybook-logo.png',

  appBg: 'white'
});

addons.setConfig({ theme });
