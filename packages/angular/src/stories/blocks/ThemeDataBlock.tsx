import { DocsContext } from '@storybook/addon-docs/blocks';
import React, { useContext } from 'react';
import { type ComponentName, LightTheme, UniThemes } from '@uni-design-system/uni-core';

export const ThemeDataBlock = ({ componentName }: { componentName: ComponentName }) => {
  const context = useContext(DocsContext) as any;
  const globals = context?.store?.userGlobals?.globals || {};
  const themeData = UniThemes[globals.themeName] || LightTheme;

  if (!themeData) {
    return <div>No theme data received yet...</div>;
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h3>Theme: {themeData.name}</h3>
      <pre>{JSON.stringify(themeData.components[componentName], null, 2)}</pre>
    </div>
  );
};
