import type { UniTheme } from './theme.model';
import type { TextRole } from '../typography';

/**
 * Dependency-free structural validation for {@link UniTheme}.
 *
 * Every theme scale is `Partial<Record<…>>`, so a malformed theme — hand
 * written, generated, or fetched as JSON — renders as silent `undefined` CSS.
 * `parseTheme` is the acceptance/rejection-with-reasons contract that every
 * theme write funnels through: the Angular `ThemeService`, the MCP theme
 * tools, and any future runtime registry all share these rules. It collects
 * every issue rather than failing fast, so a rejected theme comes back with
 * the complete repair list.
 */

/** One reason a candidate theme was rejected, anchored to a dotted path. */
export interface ThemeIssue {
  /** Dotted location, e.g. `colors.primary` or `typography.label.fontSize`. */
  path: string;
  message: string;
}

export type ThemeParseResult =
  | { success: true; theme: UniTheme; issues: [] }
  | { success: false; theme?: undefined; issues: ThemeIssue[] };

/**
 * Color tokens components cannot render without: the default variant pairs,
 * the base surfaces, and the disabled/warn states. Themes may define any
 * further tokens; these must exist.
 */
export const REQUIRED_COLOR_TOKENS = [
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'primary-surface',
  'on-primary-surface',
  'surface',
  'on-surface',
  'background',
  'on-background',
  'warn',
  'on-warn',
  'disabled',
  'on-disabled',
  'outline',
  'transparent',
] as const;

/** The canonical type scale; every theme must style each role. */
export const REQUIRED_TEXT_ROLES: readonly TextRole[] = [
  'display-large',
  'display-medium',
  'display-small',
  'headline-large',
  'headline-medium',
  'headline-small',
  'title-large',
  'title-medium',
  'title-small',
  'body-1-long',
  'body-1-short',
  'body-2-long',
  'body-2-short',
  'subtitle-1',
  'subtitle-2',
  'label',
  'button',
  'caption',
  'overline',
  'paragraph',
  'quote',
  'note',
] as const;

export const REQUIRED_SPACING_SIZES = ['none', 'xxs', 'xs', 'sm', 'md', 'lg', 'xl'] as const;
export const REQUIRED_RADII_SIZES = ['none', 'xxs', 'xs', 'sm', 'md', 'lg', 'max'] as const;
export const REQUIRED_SHADOWS = ['raised', 'menu', 'dialog', 'warn'] as const;
export const REQUIRED_THICKNESSES = ['thin', 'standard', 'thick'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCssValue = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number';

/** Nested style expression: string/number leaves, objects for selectors. */
const checkStyleExpression = (value: unknown, path: string, issues: ThemeIssue[]): void => {
  if (!isRecord(value)) {
    issues.push({ path, message: 'must be a style object' });
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined || isCssValue(entry)) continue;
    if (isRecord(entry)) {
      checkStyleExpression(entry, `${path}.${key}`, issues);
    } else {
      issues.push({ path: `${path}.${key}`, message: 'must be a string, number, or nested style object' });
    }
  }
};

const checkStringRecord = (
  value: unknown,
  path: string,
  issues: ThemeIssue[],
  required: readonly string[] = [],
  allowNumbers = false
): void => {
  if (!isRecord(value)) {
    issues.push({ path, message: 'must be an object' });
    return;
  }
  for (const key of required) {
    if (!(key in value)) issues.push({ path: `${path}.${key}`, message: 'is required' });
  }
  for (const [key, entry] of Object.entries(value)) {
    if (entry === undefined) continue;
    const ok = allowNumbers ? isCssValue(entry) : typeof entry === 'string';
    if (!ok) {
      issues.push({
        path: `${path}.${key}`,
        message: allowNumbers ? 'must be a string or number' : 'must be a string',
      });
    }
  }
};

const checkTypography = (value: unknown, issues: ThemeIssue[]): void => {
  if (!isRecord(value)) {
    issues.push({ path: 'typography', message: 'must be an object' });
    return;
  }
  for (const role of REQUIRED_TEXT_ROLES) {
    if (!(role in value)) issues.push({ path: `typography.${role}`, message: 'is required' });
  }
  for (const [role, style] of Object.entries(value)) {
    if (!isRecord(style)) {
      issues.push({ path: `typography.${role}`, message: 'must be a TextStyle object' });
      continue;
    }
    if (typeof style['fontFamily'] !== 'string') {
      issues.push({ path: `typography.${role}.fontFamily`, message: 'must be a string' });
    }
    for (const field of ['fontSize', 'lineHeight']) {
      if (!isCssValue(style[field])) {
        issues.push({ path: `typography.${role}.${field}`, message: 'must be a string or number' });
      }
    }
  }
};

const checkComponents = (value: unknown, issues: ThemeIssue[]): void => {
  if (!isRecord(value)) {
    issues.push({ path: 'components', message: 'must be an object' });
    return;
  }
  for (const [name, entry] of Object.entries(value)) {
    if (entry === undefined) continue;
    if (!isRecord(entry)) {
      issues.push({ path: `components.${name}`, message: 'must be a component theme object' });
      continue;
    }
    if (entry['fixed'] !== undefined) {
      checkStyleExpression(entry['fixed'], `components.${name}.fixed`, issues);
    }
    for (const section of ['variants', 'sizes']) {
      const styles = entry[section];
      if (styles === undefined) continue;
      if (!isRecord(styles)) {
        issues.push({ path: `components.${name}.${section}`, message: 'must be an object' });
        continue;
      }
      for (const [key, style] of Object.entries(styles)) {
        if (style !== undefined) {
          checkStyleExpression(style, `components.${name}.${section}.${key}`, issues);
        }
      }
    }
    if (entry['options'] !== undefined && !isRecord(entry['options'])) {
      issues.push({ path: `components.${name}.options`, message: 'must be an object' });
    }
  }
};

/**
 * Validate a candidate theme, collecting every structural issue. Never
 * throws; a failed result carries the complete repair list.
 */
export const parseTheme = (input: unknown): ThemeParseResult => {
  const issues: ThemeIssue[] = [];

  if (!isRecord(input)) {
    return { success: false, issues: [{ path: '', message: 'theme must be an object' }] };
  }

  for (const field of ['id', 'name']) {
    if (typeof input[field] !== 'string' || input[field] === '') {
      issues.push({ path: field, message: 'must be a non-empty string' });
    }
  }

  checkStringRecord(input['colors'], 'colors', issues, REQUIRED_COLOR_TOKENS);
  checkTypography(input['typography'], issues);
  checkStringRecord(input['borders'], 'borders', issues);
  checkStringRecord(input['radii'], 'radii', issues, REQUIRED_RADII_SIZES);
  checkStringRecord(input['shadows'], 'shadows', issues, REQUIRED_SHADOWS);
  checkStringRecord(input['spacing'], 'spacing', issues, REQUIRED_SPACING_SIZES, true);
  checkStringRecord(input['thicknesses'], 'thicknesses', issues, REQUIRED_THICKNESSES, true);
  checkStringRecord(input['icons'], 'icons', issues);
  checkComponents(input['components'], issues);

  return issues.length === 0
    ? { success: true, theme: input as unknown as UniTheme, issues: [] }
    : { success: false, issues };
};

/** Format issues for logs and error messages. */
export const formatThemeIssues = (issues: ThemeIssue[]): string =>
  issues.map(({ path, message }) => (path ? `${path} ${message}` : message)).join('; ');

/** Validate or throw, with every reason in the error message. */
export const assertTheme = (input: unknown): UniTheme => {
  const result = parseTheme(input);
  if (!result.success) {
    throw new Error(`Invalid UniTheme: ${formatThemeIssues(result.issues)}`);
  }
  return result.theme;
};

export const isUniTheme = (input: unknown): input is UniTheme => parseTheme(input).success;
