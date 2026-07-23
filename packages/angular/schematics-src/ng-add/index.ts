/**
 * `ng add @uni-design-system/uni-angular` — zero-to-styled-app.
 *
 * Installs the peer set, runs the uni-core OKLCH engine *at schematic time*,
 * and writes the resolved theme as a static `src/app/uni-theme.ts` — plain,
 * reviewable data that becomes the app's theming source of truth. The engine
 * never ships to the browser.
 *
 * The uni-core generation code is bundled into this file at build time
 * (uni-core is a peer dependency, so it isn't installed yet when ng add runs).
 */
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain, SchematicsException } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { emitThemeFile, type ThemeShape } from '@uni-design-system/uni-core';
import { version as uniVersion } from '../../package.json';
import {
  addComponentImports,
  addDependencies,
  addFontLinks,
  addProviderRegistration,
  addSmokeMarkup,
} from './transforms';

export interface NgAddOptions {
  brand?: string;
  shape?: ThemeShape;
  darkMode?: boolean;
  typography?: boolean;
  smokeTest?: boolean;
  project?: string;
}

const HEX = /^#?[0-9a-fA-F]{6}$/;

interface ProjectPaths {
  appDir: string;
  indexHtml: string;
}

const projectPaths = (tree: Tree, projectName?: string): ProjectPaths => {
  const fallback = { appDir: 'src/app', indexHtml: 'src/index.html' };
  const raw = tree.read('angular.json')?.toString();
  if (!raw) return fallback;
  try {
    const workspace = JSON.parse(raw) as {
      projects?: Record<string, { sourceRoot?: string; projectType?: string }>;
    };
    const projects = workspace.projects ?? {};
    const name =
      projectName ??
      Object.keys(projects).find((key) => projects[key].projectType !== 'library') ??
      Object.keys(projects)[0];
    const sourceRoot = (name && projects[name]?.sourceRoot) || 'src';
    return { appDir: `${sourceRoot}/app`, indexHtml: `${sourceRoot}/index.html` };
  } catch {
    return fallback;
  }
};

const firstExisting = (tree: Tree, candidates: string[]): string | undefined =>
  candidates.find((path) => tree.exists(path));

const write = (tree: Tree, path: string, content: string): void => {
  if (tree.exists(path)) tree.overwrite(path, content);
  else tree.create(path, content);
};

export function ngAdd(options: NgAddOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const seeds = (options.brand ?? '#4F46E5')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith('#') ? s : `#${s}`));
    const invalid = seeds.filter((s) => !HEX.test(s));
    if (seeds.length === 0 || invalid.length > 0) {
      throw new SchematicsException(
        `Invalid --brand value${invalid.length ? ` (${invalid.join(', ')})` : ''}. Pass 1–3 six-digit hex colors, comma-separated, e.g. --brand=#0052FF or --brand=#2C3E35,#D4A373.`
      );
    }

    const paths = projectPaths(tree, options.project);
    const emitted = emitThemeFile({
      seed: seeds.length === 1 ? seeds[0] : seeds,
      shape: options.shape ?? 'modern',
      darkMode: options.darkMode ?? true,
      name: 'Brand',
    });

    const installDeps: Rule = (t, ctx) => {
      const pkgPath = 'package.json';
      const pkgText = t.read(pkgPath)?.toString();
      if (!pkgText) throw new SchematicsException('No package.json found at the workspace root.');
      const { text, missingForms } = addDependencies(pkgText, {
        '@uni-design-system/uni-angular': `~${uniVersion}`,
        '@uni-design-system/uni-core': `~${uniVersion}`,
        '@emotion/css': '^11.0.0',
      });
      t.overwrite(pkgPath, text);
      if (missingForms) {
        ctx.logger.warn(
          '@angular/forms is not installed — Uni input components use Signal Forms. Add it with: ng add @angular/forms'
        );
      }
      ctx.addTask(new NodePackageInstallTask());
      return t;
    };

    const writeThemeFile: Rule = (t) => {
      write(t, `${paths.appDir}/uni-theme.ts`, emitted.content);
      return t;
    };

    const registerProvider: Rule = (t, ctx) => {
      const configPath = firstExisting(t, [`${paths.appDir}/app.config.ts`]);
      const source = configPath && t.read(configPath)?.toString();
      const updated = source ? addProviderRegistration(source, 'BrandThemes') : null;
      if (configPath && updated) {
        t.overwrite(configPath, updated);
      } else {
        ctx.logger.warn(
          `Could not register UNI_THEMES automatically. Add this to your providers:\n${emitted.providerSnippet}`
        );
      }
      return t;
    };

    const addTypefaces: Rule = (t, ctx) => {
      if (options.typography === false) return t;
      const html = t.read(paths.indexHtml)?.toString();
      const updated = html && addFontLinks(html);
      if (html && updated) t.overwrite(paths.indexHtml, updated);
      else
        ctx.logger.warn(
          `Could not add typeface links to ${paths.indexHtml} — add Red Hat Display and Roboto manually (BaseTypography depends on them).`
        );
      return t;
    };

    const addSmokeTest: Rule = (t, ctx) => {
      if (options.smokeTest === false) return t;
      const htmlPath = firstExisting(t, [`${paths.appDir}/app.html`, `${paths.appDir}/app.component.html`]);
      const tsPath = firstExisting(t, [`${paths.appDir}/app.ts`, `${paths.appDir}/app.component.ts`]);
      const componentSource = tsPath && t.read(tsPath)?.toString();
      const updatedComponent = componentSource
        ? addComponentImports(componentSource, ['UniTextComponent', 'UniButtonComponent'])
        : null;
      if (!htmlPath || !tsPath || !updatedComponent) {
        ctx.logger.warn('Could not scaffold the smoke test — drop a <uni-text> and a <button uni-text-button> into any component to verify the theme.');
        return t;
      }
      t.overwrite(tsPath, updatedComponent);
      t.overwrite(htmlPath, addSmokeMarkup(t.read(htmlPath)!.toString()));
      return t;
    };

    const summarize: Rule = (t, ctx) => {
      ctx.logger.info(`Uni theme generated: ${emitted.reportSummary}.`);
      ctx.logger.info(
        `Theme written to ${paths.appDir}/uni-theme.ts — it is plain data and the source of truth: edit its tokens (colors, border primitives, component overrides) to restyle the app.`
      );
      ctx.logger.info('Run `ng serve` — the smoke test section renders in your brand.');
      return t;
    };

    return chain([installDeps, writeThemeFile, registerProvider, addTypefaces, addSmokeTest, summarize]);
  };
}
