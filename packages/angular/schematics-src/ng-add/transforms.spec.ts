import { describe, expect, it } from 'vitest';
import {
  addComponentImports,
  addDependencies,
  addFontLinks,
  addProviderRegistration,
  addSmokeMarkup,
  SMOKE_MARKUP,
} from './transforms';

const APP_CONFIG = `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
`;

const APP_TS = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App {}
`;

const INDEX_HTML = `<!doctype html>
<html>
<head>
  <title>demo</title>
</head>
<body><app-root></app-root></body>
</html>
`;

describe('addDependencies', () => {
  it('adds missing deps, keeps existing ones, and flags absent @angular/forms', () => {
    const { text, missingForms } = addDependencies(
      JSON.stringify({ dependencies: { '@emotion/css': '^11.5.0' } }),
      { '@uni-design-system/uni-core': '~4.1.0', '@emotion/css': '^11.0.0' }
    );
    const pkg = JSON.parse(text);
    expect(pkg.dependencies['@uni-design-system/uni-core']).toBe('~4.1.0');
    expect(pkg.dependencies['@emotion/css']).toBe('^11.5.0');
    expect(missingForms).toBe(true);
  });

  it('sees @angular/forms wherever it lives', () => {
    const { missingForms } = addDependencies(
      JSON.stringify({ dependencies: { '@angular/forms': '^21.0.0' } }),
      {}
    );
    expect(missingForms).toBe(false);
  });
});

describe('addProviderRegistration', () => {
  it('inserts the provider and both imports', () => {
    const out = addProviderRegistration(APP_CONFIG, 'BrandThemes');
    expect(out).toContain(`import { UNI_THEMES } from '@uni-design-system/uni-angular';`);
    expect(out).toContain(`import { BrandThemes } from './uni-theme';`);
    expect(out).toContain('{ provide: UNI_THEMES, useValue: BrandThemes },');
    expect(out!.indexOf('UNI_THEMES')).toBeGreaterThan(out!.indexOf('./app.routes'));
  });

  it('is idempotent', () => {
    const once = addProviderRegistration(APP_CONFIG, 'BrandThemes')!;
    expect(addProviderRegistration(once, 'BrandThemes')).toBe(once);
  });

  it('returns null when no providers array exists', () => {
    expect(addProviderRegistration('export const x = 1;', 'BrandThemes')).toBeNull();
  });
});

describe('addFontLinks', () => {
  it('inserts links before </head> and is idempotent', () => {
    const out = addFontLinks(INDEX_HTML)!;
    expect(out).toContain('family=Red+Hat+Display');
    expect(out.indexOf('fonts.googleapis')).toBeLessThan(out.indexOf('</head>'));
    expect(addFontLinks(out)).toBe(out);
  });

  it('returns null without a head element', () => {
    expect(addFontLinks('<body></body>')).toBeNull();
  });
});

describe('smoke test scaffolding', () => {
  it('prepends markup once', () => {
    const out = addSmokeMarkup('<router-outlet />');
    expect(out.startsWith(SMOKE_MARKUP)).toBe(true);
    expect(addSmokeMarkup(out)).toBe(out);
  });

  it('adds component classes to the imports array and import statement', () => {
    const out = addComponentImports(APP_TS, ['UniTextComponent', 'UniButtonComponent'])!;
    expect(out).toContain('imports: [UniTextComponent, UniButtonComponent, RouterOutlet]');
    expect(out).toContain(`import { UniTextComponent, UniButtonComponent } from '@uni-design-system/uni-angular';`);
    expect(addComponentImports(out, ['UniTextComponent', 'UniButtonComponent'])).toBe(out);
  });
});
