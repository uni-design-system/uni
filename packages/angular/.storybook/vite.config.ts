import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular(), tsconfigPaths()], // This lets Vite resolve @uni/core from your tsconfig
});
