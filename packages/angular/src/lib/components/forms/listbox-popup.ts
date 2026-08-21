import type { CSSObject } from '@emotion/css/create-instance';
import type { ColorKey, ContainerColorToken, Radius, Shadow } from '@uni-design-system/uni-core';
import type { ThemeService } from '../../theming';

/**
 * The theme options every listbox popup shares — the "list trio" plus the
 * active-option fill. Component option interfaces (searchInput, tagInput,
 * timeInput, combobox) satisfy this structurally; their extra options ride
 * alongside. `ColorKey`-typed so the wider `searchInput` contract (custom
 * theme color tokens) stays satisfiable; `colorPair` resolves any registered
 * token at runtime.
 */
export interface UniListboxPopupOptions {
  /** Popup surface; its on-color pair is derived and cascades to options. */
  listColor?: ColorKey;
  listShadow?: Shadow;
  listBorderRadius?: Radius;
  /** Active/hover option fill; the on-color pair is derived. Must contrast
      with `listColor` or keyboard navigation turns invisible. */
  activeColor?: ColorKey;
}

/**
 * Style block for the popup behind every `ListboxNavigation` consumer: an
 * absolutely-positioned `ul[role="listbox"]` under a `position: relative`
 * field wrapper, with the shared option chrome and active/hover highlight.
 *
 * Extracted because four components (`uni-search-input`, `uni-tag-input`,
 * `uni-time-input`, `uni-combobox`) carried hand-rolled copies, and the parts
 * that silently drift between copies all live here: the surface/elevation
 * trio, and the `activeColor` pair that themes re-point when their container
 * tokens don't contrast (see the Wellsourced overrides).
 *
 * Compose extras with the array form — `css([listboxPopupStyles(…), {…}])` —
 * so a component's own `& [role="option"]` block cascades after this one
 * instead of replacing it (an object spread would overwrite the key).
 */
export const listboxPopupStyles = (
  theme: ThemeService,
  options: UniListboxPopupOptions,
  { maxHeight = 280 }: { maxHeight?: number } = {}
): CSSObject => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 20,
  margin: '4px 0 0',
  padding: 4,
  listStyle: 'none',
  maxHeight,
  overflowY: 'auto',
  ...theme.colorPair((options.listColor ?? 'primary-surface') as ContainerColorToken),
  ...theme.boxShadow(options.listShadow ?? 'menu'),
  ...theme.radius(options.listBorderRadius ?? 'xs'),
  '& [role="option"]': {
    padding: '8px 12px',
    cursor: 'pointer',
    ...theme.typeface('label'),
    ...theme.radius('xxs'),
    '&.active, &:not([aria-disabled="true"]):hover': {
      ...theme.colorPair((options.activeColor ?? 'primary-container') as ContainerColorToken),
    },
  },
});
