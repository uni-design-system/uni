import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const theme = create({
  base: 'light',
  brandTitle: 'UNI Design System',
  brandUrl: 'https://uni-design-system.github.io/uni/docs/angular',
  brandImage: 'uni-storybook-logo.png',

  appBg: 'white',
});

addons.setConfig({
  theme,
  sidebar: {
    // This filter excludes individual stories from the sidebar list,
    // leaving only the MDX documentation pages visible.
    filters: {
      patterns: (item) => {
        return item.type === 'docs';
      },
    },
  },
});
