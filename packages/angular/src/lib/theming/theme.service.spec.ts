import { TestBed } from '@angular/core/testing';
import {
  BaseIcons,
  createTheme,
  DarkTheme,
  dehydrateTheme,
  LightTheme,
} from '@uni-design-system/uni-core';

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

  describe('themes that arrive as JSON', () => {
    /** The wire form the MCP tools and theme registry serve. */
    const wire = () =>
      JSON.parse(JSON.stringify(dehydrateTheme({ ...LightTheme, id: 'Wire', name: 'Wire' })));

    it('restores the built-in icons a JSON payload elided', () => {
      const service = setup();
      const payload = wire();
      expect(payload.icons).toEqual({});

      const result = service.registerTheme(payload, { select: true });

      expect(result.success).toBe(true);
      expect(Object.keys(service.theme().icons)).toHaveLength(Object.keys(BaseIcons).length);
      expect(service.theme().icons).toEqual(LightTheme.icons);
    });

    it("keeps the payload's own icons over the built-ins", () => {
      const service = setup();
      const [firstName] = Object.keys(BaseIcons);
      const payload = { ...wire(), icons: { [firstName]: 'data:image/svg+xml,mine' } };

      service.registerTheme(payload, { select: true });

      expect(service.theme().icons[firstName]).toBe('data:image/svg+xml,mine');
      expect(Object.keys(service.theme().icons)).toHaveLength(Object.keys(BaseIcons).length);
    });

    it('hydrates through setTheme too', () => {
      const service = setup();
      service.setTheme(wire());
      expect(Object.keys(service.theme().icons)).toHaveLength(Object.keys(BaseIcons).length);
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

  describe('motion tokens', () => {
    it('resolves a named motion primitive from the theme', () => {
      const service = setup();
      expect(service.motion('popup')).toEqual({ duration: 100, easing: 'linear', scale: 0.8 });
    });

    it('gives popup and panel different timings, because they move differently', () => {
      const service = setup();
      expect(service.motion('panel').duration).toBeGreaterThan(service.motion('popup').duration);
    });

    it('falls back to popup for an unnamed or unknown token', () => {
      // A component that never set one, or a theme that dropped the token it
      // named, still animates rather than snapping into place.
      const service = setup();
      expect(service.motion(undefined)).toEqual(service.motion('popup'));
      expect(service.motion('no-such-token')).toEqual(service.motion('popup'));
    });

    it('survives a theme that predates the motion scale', () => {
      // Registered-as-JSON themes are a supported channel and the validator
      // does not require `motion`, so reading it must not crash.
      const { motion: _dropped, ...older } = LightTheme;
      const service = setup({ Older: older });

      expect(service.motion('popup')).toEqual({ duration: 100, easing: 'linear', scale: 0.8 });
    });

    it('lets a theme retime every overlay at once', () => {
      const slow = createTheme({
        id: 'Slow',
        name: 'Slow',
        colors: LightTheme.colors,
        motion: { popup: { duration: 400, easing: 'ease-out', scale: 0.9 } },
      });
      const service = setup({ Slow: slow });

      expect(service.motion('popup')).toEqual({ duration: 400, easing: 'ease-out', scale: 0.9 });
      // Untouched tokens still come from the base scale.
      expect(service.motion('panel').duration).toBe(250);
    });
  });
});
