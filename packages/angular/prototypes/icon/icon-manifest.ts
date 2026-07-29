// types/icon-manifest.ts
export type IconSlot =
  | 'navigation.menu'
  | 'navigation.chevron-down'
  | 'action.search'
  | 'action.close'
  | 'feedback.success'; // ... expand to all 28 slots

export interface ThemeIconData {
  viewBox: string;
  /** The inner elements of the SVG (paths, circles, rects) as a clean string */
  innerHtml: string;
}

export interface AngularThemeManifest {
  themeId: string;
  slots: Record<IconSlot, ThemeIconData>;
}
