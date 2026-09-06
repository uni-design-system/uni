/// <reference types="vitest" />
// `defineConfig` from vitest/config, not vite: only vitest's overload accepts
// the `test` block, so importing it from vite makes this file fail a typecheck.
import { transformWithOxc, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

/**
 * Workaround for @analogjs/vite-plugin-angular 2.5.x under Vite 8: its
 * vitest sourcemap pass transforms .ts files the Angular compiler skipped
 * (spec files without decorators) with a hardcoded `lang: 'js'`, which
 * chokes on TypeScript syntax. Pre-transpile spec/setup files with the
 * correct language so downstream passes only ever see JS.
 * Note: keep spec files decorator-free (use TestBed, not @Component test
 * hosts) — this pass does not apply Angular's compiler.
 */
function specFilesAsTypescript(): Plugin {
  return {
    name: 'uni-spec-ts-transform',
    enforce: 'pre',
    async transform(code, id) {
      // schematics-src is plain decorator-free TS too — same treatment.
      if (!/\.spec\.ts$|test-setup\.ts$|schematics-src\/.*\.ts$/.test(id)) return;
      return transformWithOxc(code, id, { lang: 'ts' });
    },
  };
}

export default defineConfig({
  plugins: [specFilesAsTypescript(), angular()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts', 'schematics-src/**/*.spec.ts'],
    // `@angular-devkit/schematics` 22.x is CommonJS but depends on
    // magic-string 1.0, which is ESM-only. Node loads that pairing natively via
    // `require(esm)`; Vitest's module runner cannot, and no `server.deps`
    // setting bridges it — so the schematic runner's spec cannot load. The
    // pure-logic half (transforms.spec.ts) still runs. Tracked in TODO.md.
    exclude: ['**/node_modules/**', '**/dist/**', 'schematics-src/ng-add/ng-add.spec.ts'],
    reporters: ['default'],
  },
});
