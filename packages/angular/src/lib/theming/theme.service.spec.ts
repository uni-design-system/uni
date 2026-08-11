import { TestBed } from '@angular/core/testing';
import { DarkTheme, LightTheme } from '@uni-design-system/uni-core';

import { ThemeService } from './theme.service';
import { UNI_THEMES } from './theme.token';

describe('ThemeService', () => {
  const setup = (themes: Record<string, unknown> = { LightTheme, DarkTheme }) => {
    TestBed.configureTestingModule({
      providers: [{ provide: UNI_THEMES, useValue: themes }],
    });
    return TestBed.inject(ThemeService);
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('seeds the registry from UNI_THEMES and selects the first theme', () => {
    const service = setup();
    expect(service.themeOptions()).toEqual([
      { label: 'Light Theme', value: 'LightTheme' },
      { label: 'Dark Theme', value: 'DarkTheme' },
    ]);
    expect(service.selectedThemeKey()).toBe('LightTheme');
  });

  it('excludes an invalid injected theme with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const service = setup({ LightTheme, Broken: { id: 'Broken' } });

    expect(service.themeOptions().map((option) => option.value)).toEqual(['LightTheme']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Uni theme 'Broken' rejected"));
    warn.mockRestore();
  });

  describe('selectTheme', () => {
    it('activates and persists a registered theme', () => {
      const service = setup();
      expect(service.selectTheme('DarkTheme')).toBe(true);
      expect(service.theme().id).toBe(DarkTheme.id);
      expect(localStorage.getItem('theme')).toContain('DarkTheme');
    });

    it('returns false and touches nothing for an unknown key', () => {
      const service = setup();
      const before = service.theme();

      expect(service.selectTheme('Nope')).toBe(false);
      expect(service.theme()).toBe(before);
      expect(service.selectedThemeKey()).toBe('LightTheme');
      expect(localStorage.getItem('theme')).not.toContain('Nope');
    });
  });

  describe('setTheme', () => {
    it('accepts a valid theme without registering it', () => {
      const service = setup({ LightTheme });
      const result = service.setTheme(DarkTheme);

      expect(result.success).toBe(true);
      expect(service.theme().id).toBe(DarkTheme.id);
      expect(service.themeOptions().map((option) => option.value)).toEqual(['LightTheme']);
    });

    it('rejects a malformed theme with reasons, leaving the active theme unchanged', () => {
      const service = setup();
      const before = service.theme();
      const result = service.setTheme({ id: 'bad', name: 'Bad' });

      expect(result.success).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues.some((issue) => issue.path.startsWith('colors'))).toBe(true);
      expect(service.theme()).toBe(before);
    });
  });

  describe('registerTheme / unregisterTheme', () => {
    const custom = { ...LightTheme, id: 'Custom', name: 'Custom' };

    it('adds a validated theme to the options and can select it', () => {
      const service = setup();
      const result = service.registerTheme(custom, { select: true });

      expect(result.success).toBe(true);
      expect(service.themeOptions().map((option) => option.value)).toContain('Custom');
      expect(service.selectedThemeKey()).toBe('Custom');
    });

    it('rejects an invalid theme without registering', () => {
      const service = setup();
      const result = service.registerTheme({ id: 'nope', name: 'Nope' });

      expect(result.success).toBe(false);
      expect(service.themeOptions().map((option) => option.value)).not.toContain('nope');
    });

    it('unregistering the active theme falls back to the first remaining', () => {
      const service = setup();
      service.registerTheme(custom, { select: true });

      service.unregisterTheme('Custom');
      expect(service.themeOptions().map((option) => option.value)).not.toContain('Custom');
      expect(service.selectedThemeKey()).toBe('LightTheme');
      expect(service.theme().id).toBe(LightTheme.id);
    });
  });

  describe('custom brand palette', () => {
    const config = { seed: '#2C3E35', scheme: 'triadic', category: 'earth' } as const;

    it('applyPalette registers a selectable "Your Brand" option', () => {
      const service = setup();
      service.applyPalette(config);

      expect(service.themeOptions()).toContainEqual({
        label: 'Your Brand',
        value: ThemeService.CUSTOM_KEY,
      });
      expect(service.isCustomTheme()).toBe(true);

      // Switching away and back works — the theme-switch inconsistency fix.
      service.selectTheme('DarkTheme');
      expect(service.isCustomTheme()).toBe(false);
      expect(service.selectTheme(ThemeService.CUSTOM_KEY)).toBe(true);
      expect(service.isCustomTheme()).toBe(true);
    });

    it('clearCustomPalette removes the option and falls back', () => {
      const service = setup();
      service.applyPalette(config);
      service.clearCustomPalette();

      expect(service.customPalette()).toBeNull();
      expect(
        service.themeOptions().map((option) => option.value)
      ).not.toContain(ThemeService.CUSTOM_KEY);
      expect(service.selectedThemeKey()).toBe('LightTheme');
    });
  });
});
