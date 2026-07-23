import { describe, expect, it } from 'vitest';
import { callRule, HostTree, type SchematicContext, type Tree } from '@angular-devkit/schematics';
import { ngAdd, type NgAddOptions } from './index';

const context = {
  addTask: () => {},
  logger: { info: () => {}, warn: () => {}, error: () => {} },
} as unknown as SchematicContext;

const freshApp = (): Tree => {
  const tree = new HostTree();
  tree.create(
    'package.json',
    JSON.stringify({ dependencies: { '@angular/core': '^21.0.0', '@angular/forms': '^21.0.0' } }, null, 2)
  );
  tree.create(
    'angular.json',
    JSON.stringify({ projects: { demo: { projectType: 'application', sourceRoot: 'src' } } }, null, 2)
  );
  tree.create(
    'src/index.html',
    '<!doctype html>\n<html>\n<head>\n<title>demo</title>\n</head>\n<body><app-root></app-root></body>\n</html>\n'
  );
  tree.create(
    'src/app/app.config.ts',
    "import { ApplicationConfig } from '@angular/core';\nimport { provideRouter } from '@angular/router';\nimport { routes } from './app.routes';\n\nexport const appConfig: ApplicationConfig = {\n  providers: [provideRouter(routes)],\n};\n"
  );
  tree.create(
    'src/app/app.ts',
    "import { Component } from '@angular/core';\nimport { RouterOutlet } from '@angular/router';\n\n@Component({\n  selector: 'app-root',\n  imports: [RouterOutlet],\n  templateUrl: './app.html',\n})\nexport class App {}\n"
  );
  tree.create('src/app/app.html', '<router-outlet />\n');
  return tree;
};

const run = async (options: NgAddOptions, tree = freshApp()): Promise<Tree> =>
  new Promise((resolve, reject) => {
    callRule(ngAdd(options), tree, context).subscribe({ next: resolve, error: reject });
  });

const text = (tree: Tree, path: string): string => tree.read(path)!.toString();

describe('ng-add schematic', () => {
  it('wires a fresh app end to end', async () => {
    const tree = await run({ brand: '#0052FF,#D4A373', shape: 'playful' });

    const pkg = JSON.parse(text(tree, 'package.json'));
    expect(pkg.dependencies['@uni-design-system/uni-angular']).toMatch(/^~/);
    expect(pkg.dependencies['@uni-design-system/uni-core']).toMatch(/^~/);
    expect(pkg.dependencies['@emotion/css']).toBeDefined();

    const theme = text(tree, 'src/app/uni-theme.ts');
    expect(theme).toContain('export const BrandThemes = { BrandLight, BrandDark }');
    expect(theme).toContain("'48px'"); // playful radii preset

    expect(text(tree, 'src/app/app.config.ts')).toContain(
      '{ provide: UNI_THEMES, useValue: BrandThemes },'
    );
    expect(text(tree, 'src/index.html')).toContain('family=Red+Hat+Display');
    expect(text(tree, 'src/app/app.html')).toMatch(/^<!-- Uni smoke test/);
    expect(text(tree, 'src/app/app.ts')).toContain(
      'imports: [UniTextComponent, UniButtonComponent, RouterOutlet]'
    );
  });

  it('honors opt-outs and single-theme mode', async () => {
    const tree = await run({ brand: '#C2185B', darkMode: false, typography: false, smokeTest: false });
    expect(text(tree, 'src/app/uni-theme.ts')).not.toContain('BrandDark');
    expect(text(tree, 'src/index.html')).not.toContain('fonts.googleapis');
    expect(text(tree, 'src/app/app.html')).toBe('<router-outlet />\n');
  });

  it('rejects malformed brand input', async () => {
    await expect(run({ brand: 'blue' })).rejects.toThrow(/Invalid --brand/);
  });

  it('is idempotent when re-run', async () => {
    const once = await run({ brand: '#0052FF' });
    const config = text(once, 'src/app/app.config.ts');
    const twice = await run({ brand: '#0052FF' }, once);
    expect(text(twice, 'src/app/app.config.ts')).toBe(config);
    expect(text(twice, 'src/app/app.html').match(/Uni smoke test/g)).toHaveLength(1);
  });
});
