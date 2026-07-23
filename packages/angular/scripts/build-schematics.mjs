/**
 * Bundles the ng-add schematic into `schematics/` (copied into dist by
 * ng-packagr's assets). uni-core is bundled in — it's a peer dependency, so it
 * isn't installed yet at `ng add` time; the devkit packages stay external
 * because the Angular CLI provides them at execution time.
 */
import { build } from 'vite';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

await build({
  configFile: false,
  logLevel: 'warn',
  build: {
    lib: {
      entry: resolve(root, 'schematics-src/ng-add/index.ts'),
      formats: ['cjs'],
      fileName: () => 'index.js',
    },
    outDir: resolve(root, 'schematics/ng-add'),
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
    target: 'node20',
    rollupOptions: {
      external: [/^@angular-devkit\//, /^node:/],
    },
  },
});

mkdirSync(resolve(root, 'schematics/ng-add'), { recursive: true });
copyFileSync(resolve(root, 'schematics-src/collection.json'), resolve(root, 'schematics/collection.json'));
copyFileSync(resolve(root, 'schematics-src/ng-add/schema.json'), resolve(root, 'schematics/ng-add/schema.json'));
console.log('schematics bundled → schematics/');
