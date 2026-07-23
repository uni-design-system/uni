import type { Colors, Radii, Spacing } from '../theme/theme.model';

/** A single W3C DTCG design token. */
export interface DtcgToken {
  $value: string;
  $type: 'color' | 'dimension';
}

/** DTCG-format token document (Style Dictionary compatible), per PRD §6. */
export interface DtcgTokens {
  color: Record<string, DtcgToken>;
  size: {
    radius: Record<string, DtcgToken>;
    spacing: Record<string, DtcgToken>;
  };
}

const dimensionEntries = (record: Radii | Spacing | undefined): Record<string, DtcgToken> =>
  Object.fromEntries(
    Object.entries(record ?? {})
      .filter(([, value]) => value !== undefined && value !== 'none')
      .map(([key, value]) => [key, { $value: String(value), $type: 'dimension' as const }])
  );

/**
 * Render one theme mode's tokens as W3C DTCG JSON for external pipelines
 * (Style Dictionary etc.). Token names are exactly Uni's `ColorToken` strings —
 * one vocabulary everywhere. The native `UniTheme` object remains the primary,
 * lossless output; this is the interop layer.
 */
export const emitDtcgTokens = (input: {
  colors: Colors;
  radii?: Radii;
  spacing?: Spacing;
}): DtcgTokens => ({
  color: Object.fromEntries(
    Object.entries(input.colors)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, { $value: value as string, $type: 'color' as const }])
  ),
  size: {
    radius: dimensionEntries(input.radii),
    spacing: dimensionEntries(input.spacing),
  },
});
