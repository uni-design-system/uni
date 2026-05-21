export interface ThemePalette {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  warn: string;
  success: string;
  light: string;
  onLight: string;
  onLightVariant: string;
  dark: string;
  onDark: string;
  background: string;
  disabled: string;
  onDisabled: string;
}

// ==========================================
// 🏛️ 1. GENERIC BASE PALETTES (WCAG AA)
// ==========================================

export const genericLightTheme: ThemePalette = {
  primary: '#0066B2',
  secondary: '#008528',
  tertiary: '#D97706',
  quaternary: '#52525B',
  warn: '#DC2626',
  success: '#008528',
  light: '#F4F4F5',
  onLight: '#18181B',
  onLightVariant: 'rgba(24, 24, 27, 0.6)',
  dark: '#18181B',
  onDark: 'rgba(255, 255, 255, 0.85)',
  background: '#FFFFFF',
  disabled: 'rgba(24, 24, 27, 0.08)',
  onDisabled: 'rgba(24, 24, 27, 0.4)',
};

export const genericDarkTheme: ThemePalette = {
  primary: '#4DABFF',
  secondary: '#47D973',
  tertiary: '#FBBF24',
  quaternary: '#A1A1AA',
  warn: '#FCA5A5',
  success: '#47D973',
  light: '#27272A',
  onLight: '#F4F4F5',
  onLightVariant: 'rgba(244, 244, 245, 0.5)',
  dark: '#09090B',
  onDark: 'rgba(244, 244, 245, 0.85)',
  background: '#09090B',
  disabled: 'rgba(244, 244, 245, 0.12)',
  onDisabled: 'rgba(244, 244, 245, 0.4)',
};

// ==========================================
// 🎨 2. STYLIZED PALETTES (Vibrant Varsity)
// ==========================================

export const stylizedLightTheme: ThemePalette = {
  primary: '#6366F1',
  secondary: '#EC4899',
  tertiary: '#F59E0B',
  quaternary: '#64748B',
  warn: '#EF4444',
  success: '#10B981',
  light: '#F8FAFC',
  onLight: '#0F172A',
  onLightVariant: 'rgba(15, 23, 42, 0.6)',
  dark: '#0F172A',
  onDark: 'rgba(255, 255, 255, 0.9)',
  background: '#FFFFFF',
  disabled: 'rgba(15, 23, 42, 0.08)',
  onDisabled: 'rgba(15, 23, 42, 0.4)',
};

export const stylizedDarkTheme: ThemePalette = {
  primary: '#818CF8',
  secondary: '#F472B6',
  tertiary: '#FBBF24',
  quaternary: '#94A3B8',
  warn: '#F87171',
  success: '#34D399',
  light: '#1E293B',
  onLight: '#F8FAFC',
  onLightVariant: 'rgba(248, 250, 252, 0.5)',
  dark: '#020617',
  onDark: 'rgba(248, 250, 252, 0.85)',
  background: '#020617',
  disabled: 'rgba(248, 250, 252, 0.12)',
  onDisabled: 'rgba(248, 250, 252, 0.4)',
};

// ==========================================
// 👁️ 3. HIGH-CONTRAST PALETTES (WCAG AAA)
// ==========================================

export const highContrastLightTheme: ThemePalette = {
  primary: '#004080',
  secondary: '#005914',
  tertiary: '#804B00',
  quaternary: '#262626',
  warn: '#990000',
  success: '#005914',
  light: '#FFFFFF',
  onLight: '#000000',
  onLightVariant: '#262626',
  dark: '#000000',
  onDark: '#FFFFFF',
  background: '#FFFFFF',
  disabled: '#CCCCCC',
  onDisabled: '#000000', // High visibility fallback override for high contrast users
};

export const highContrastDarkTheme: ThemePalette = {
  primary: '#99CCFF',
  secondary: '#86FFAC',
  tertiary: '#FFE066',
  quaternary: '#E5E5E5',
  warn: '#FF9999',
  success: '#86FFAC',
  light: '#121212',
  onLight: '#FFFFFF',
  onLightVariant: '#E5E5E5',
  dark: '#000000',
  onDark: '#FFFFFF',
  background: '#000000',
  disabled: '#333333',
  onDisabled: '#FFFFFF', // High visibility fallback override for high contrast users
};
