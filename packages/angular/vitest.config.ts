/// <reference types="vitest" />
import { defineConfig, transformWithOxc, type Plugin } from 'vite';
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
      if (!/\.spec\.ts$|test-setup\.ts$/.test(id)) return;
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
    include: ['src/**/*.spec.ts'],
    reporters: ['default'],
  },
});
