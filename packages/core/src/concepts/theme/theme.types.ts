import type { ContentColorToken } from '../color';
import type { Variant } from '../variant';

export type themes = 'uni' | 'carbon' | 'material' | 'bootstrap';

// `Variant` moved to `concepts/variant` when it became an open registry. Kept
// re-exported from here so the import path consumers already use is unchanged.
export type { Variant } from '../variant';
export type { UniVariantRegistry } from '../variant';

export type TextColor = ContentColorToken | Variant;

/**
 * A tag's style archetype, orthogonal to its {@link Variant} colour role: the
 * variant says *which* colour, the tone says *how* it is applied. Themes express
 * tones as nested `&.tone-*` selectors inside each variant, so both axes stay in
 * one place.
 */
export type TagTone = 'soft' | 'solid' | 'outline';
