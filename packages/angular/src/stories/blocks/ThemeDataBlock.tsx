import React from 'react';
import { type ComponentName } from '@uni-design-system/uni-core';
import { useActiveTheme } from './ThemedSurface';

export const ThemeDataBlock = ({ componentName }: { componentName: ComponentName }) => {
  const themeData = useActiveTheme();

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
      <h3>Theme: {themeData.name}</h3>
      <pre>{JSON.stringify(themeData.components[componentName], null, 2)}</pre>
    </div>
  );
};
