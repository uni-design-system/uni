import { DocsContext } from '@storybook/addon-docs/blocks';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import { UniThemes, type UniTheme } from '@uni-design-system/uni-core';
import { CarbonThemes } from '../themes/carbon.theme';

/** Same merged map the preview registers; first key is the default. */
const AllThemes: Record<string, UniTheme> = { ...UniThemes, ...CarbonThemes };

const themeFor = (key: string | undefined): UniTheme =>
  (key && AllThemes[key]) || Object.values(AllThemes)[0];

/**
 * The theme selected in the toolbar (the `uniTheme` global), live: re-renders
 * the calling block when the selection changes. The one correct way for a
 * React doc block to read the active theme — the toolbar global is `uniTheme`
 * and the registered set includes the Carbon themes, so ad-hoc lookups
 * against `UniThemes` silently pin to LightTheme.
 */
export function useActiveTheme(): UniTheme {
  const context = useContext(DocsContext) as any;
  const [theme, setTheme] = useState(() =>
    themeFor(context?.store?.userGlobals?.globals?.uniTheme)
  );

  useEffect(() => {
    const channel = context?.channel || (globalThis as any).__STORYBOOK_ADDONS_CHANNEL__;
    if (!channel) return;
    const update = ({ globals }: { globals?: Record<string, string> }) =>
      setTheme(themeFor(globals?.uniTheme));
    channel.on('globalsUpdated', update);
    return () => channel.off('globalsUpdated', update);
  }, [context]);

  return theme;
}

/**
 * Paints the active theme's background behind docs content. The docs canvas
 * itself never takes the theme background, so without this wrapper a story
 * embedded in a docs page renders dark-theme inks on the white page.
 */
export function ThemedSurface({ children }: { children: ReactNode }) {
  const theme = useActiveTheme();

  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: '12px',
        backgroundColor: theme.colors.background,
        color: theme.colors['on-background'],
      }}
    >
      {children}
    </div>
  );
}
