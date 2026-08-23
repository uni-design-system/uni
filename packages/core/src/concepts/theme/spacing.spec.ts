import { describe, expect, it } from 'vitest';
import { BaseTheme, createTheme } from './themes/base.theme';
import { parseTheme } from './theme.validation';

describe('the spacing scale', () => {
  it('defines every named step, xxl included', () => {
    // xxl was in the `Size` union but absent from every base theme, so
    // `padding="xxl"` type-checked and silently rendered nothing.
    for (const step of ['none', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl']) {
      expect(BaseTheme.spacing[step]).toBeDefined();
    }
  });

  it('merges a theme\'s spacing over the base scale', () => {
    const theme = createTheme({
      id: 'T',
      name: 'Test',
      colors: BaseTheme.colors,
      spacing: { md: '12px', tight: '6px' },
    });

    expect(theme.spacing['md']).toBe('12px'); // restated
    expect(theme.spacing['tight']).toBe('6px'); // added
    expect(theme.spacing['lg']).toBe('32px'); // untouched, still tracking base
  });

  it('leaves the base scale alone when a theme omits spacing', () => {
    const theme = createTheme({ id: 'T', name: 'Test', colors: BaseTheme.colors });
    expect(theme.spacing).toEqual(BaseTheme.spacing);
  });

  it('validates a theme carrying extra named steps', () => {
    const theme = createTheme({
      id: 'T',
      name: 'Test',
      colors: BaseTheme.colors,
      spacing: { tight: '6px', roomy: 22 },
    });
    const result = parseTheme(theme);
    expect(result.success).toBe(true);
  });

  it('still rejects a non-CSS spacing value', () => {
    const result = parseTheme({
      ...BaseTheme,
      spacing: { ...BaseTheme.spacing, tight: {} as unknown as string },
    });
    expect(result.success).toBe(false);
  });
});
