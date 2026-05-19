import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.json',
      outDir: 'dist/types',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UniReact',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'esm/index.js' : 'cjs/index.cjs'),
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: ['react', 'react-dom', '@uni-design-system/uni-core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@uni-design-system/uni-core': 'UniCore',
        },
      },
    },
  },
});
