import React from 'react';
import { type ComponentName } from '@uni-design-system/uni-core';
import { useActiveTheme } from './ThemedSurface';

const cell: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid rgba(128,128,128,0.25)',
  textAlign: 'left',
  verticalAlign: 'top',
};

const code: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12.5,
};

const isColor = (value: unknown): value is string =>
  typeof value === 'string' && (/^#([0-9a-fA-F]{3,8})$/.test(value) || value.startsWith('rgba'));

/**
 * The component's theme option tokens, read live from the active Storybook
 * theme — the values a `createTheme` override (or the static `uni-theme.ts`
 * `components` section) can re-point. Complements the playground knobs:
 * knobs are per-instance inputs, these are per-theme options.
 */
export const ThemeOptions = ({ componentName }: { componentName: ComponentName }) => {
  const theme = useActiveTheme();
  const options = (theme.components[componentName]?.options ?? {}) as Record<string, unknown>;
  const entries = Object.entries(options);

  if (entries.length === 0) {
    return (
      <p>
        <code style={code}>{componentName}</code> defines no theme options — its styling comes
        entirely from variants, sizes, and shared tokens.
      </p>
    );
  }

  return (
    <div>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={cell}>Option</th>
            <th style={cell}>Value ({theme.name})</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td style={{ ...cell, ...code }}>{key}</td>
              <td style={{ ...cell, ...code }}>
                {isColor(value) && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      marginRight: 6,
                      borderRadius: 3,
                      background: value,
                      border: '1px solid rgba(128,128,128,0.4)',
                      verticalAlign: 'middle',
                    }}
                  />
                )}
                {value === undefined ? '—' : JSON.stringify(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12.5, opacity: 0.75 }}>
        Theme options are set per theme, not per instance: override them in{' '}
        <code style={code}>createTheme({'{ components }'})</code> or your app's{' '}
        <code style={code}>uni-theme.ts</code>. String values are token names resolved against
        the theme's palettes and scales.
      </p>
    </div>
  );
};
