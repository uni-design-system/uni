/**
 * Pure text transforms for the ng-add schematic. Each takes source text and
 * returns the transformed text, `null` when its anchor can't be found (the
 * factory then logs the manual step instead of guessing), or the input
 * unchanged when the transform was already applied (idempotent re-runs).
 */

export interface AddDependenciesResult {
  text: string;
  /** True when @angular/forms is absent — Signal Forms inputs need it. */
  missingForms: boolean;
}

export const addDependencies = (
  packageJsonText: string,
  deps: Record<string, string>
): AddDependenciesResult => {
  const pkg = JSON.parse(packageJsonText) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  pkg.dependencies ??= {};
  for (const [name, version] of Object.entries(deps)) {
    if (!pkg.dependencies[name] && !pkg.devDependencies?.[name]) pkg.dependencies[name] = version;
  }
  const missingForms = !pkg.dependencies['@angular/forms'] && !pkg.devDependencies?.['@angular/forms'];
  return { text: `${JSON.stringify(pkg, null, 2)}\n`, missingForms };
};

const afterLastImport = (source: string, addition: string): string => {
  const lastImport = [...source.matchAll(/^import .*?;$/gms)].pop();
  if (!lastImport || lastImport.index === undefined) return `${addition}\n${source}`;
  const at = lastImport.index + lastImport[0].length;
  return `${source.slice(0, at)}\n${addition}${source.slice(at)}`;
};

/** Register `UNI_THEMES` in an app.config.ts source. */
export const addProviderRegistration = (source: string, themesExport: string): string | null => {
  if (source.includes('UNI_THEMES')) return source;
  const anchor = source.match(/providers:\s*\[/);
  if (!anchor || anchor.index === undefined) return null;
  const at = anchor.index + anchor[0].length;
  const withProvider = `${source.slice(0, at)}\n    { provide: UNI_THEMES, useValue: ${themesExport} },${source.slice(at)}`;
  return afterLastImport(
    withProvider,
    `import { UNI_THEMES } from '@uni-design-system/uni-angular';\nimport { ${themesExport} } from './uni-theme';`
  );
};

export const FONT_LINKS = [
  '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
  '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
  '  <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />',
  '',
].join('\n');

/** Add Uni's typeface links (Red Hat Display + Roboto) to index.html. */
export const addFontLinks = (html: string): string | null => {
  if (html.includes('family=Red+Hat+Display')) return html;
  const at = html.indexOf('</head>');
  if (at === -1) return null;
  return html.slice(0, at) + FONT_LINKS + html.slice(at);
};

export const SMOKE_MARKUP = [
  '<!-- Uni smoke test: remove once the theme renders. -->',
  '<section style="display: flex; gap: 12px; align-items: center; padding: 16px;">',
  '  <uni-text typeface="headline-small">Uni is wearing your brand</uni-text>',
  '  <button uni-text-button variant="primary" size="md">Primary</button>',
  '  <button uni-text-button variant="secondary" size="md">Secondary</button>',
  '</section>',
  '',
  '',
].join('\n');

/** Prepend the smoke-test markup to the app component template. */
export const addSmokeMarkup = (html: string): string =>
  html.includes('Uni smoke test') ? html : SMOKE_MARKUP + html;

/** Add Uni component classes to a standalone component's `imports: [...]`. */
export const addComponentImports = (source: string, symbols: string[]): string | null => {
  const missing = symbols.filter((s) => !source.includes(s));
  if (missing.length === 0) return source;
  const anchor = source.match(/imports:\s*\[/);
  if (!anchor || anchor.index === undefined) return null;
  const at = anchor.index + anchor[0].length;
  const withSymbols = `${source.slice(0, at)}${missing.join(', ')}, ${source.slice(at)}`;
  return afterLastImport(
    withSymbols,
    `import { ${missing.join(', ')} } from '@uni-design-system/uni-angular';`
  );
};
