import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    stdio: 'src/server/stdio.ts',
    http: 'src/server/http.ts',
    server: 'src/server/core.ts',
  },
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  dts: { entry: { server: 'src/server/core.ts' } },
  clean: true,
  sourcemap: true,
  // The generated index ships alongside the bundle; it is read at runtime.
  publicDir: false,
  banner: { js: '#!/usr/bin/env node' },
});
