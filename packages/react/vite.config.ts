import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'unplugin-dts/vite'; // Essential for shipping types
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({ insertTypesEntry: true }) // Automatically generates .d.ts files
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'UniReact',
      formats: ['es'], // Modern libraries typically only need ES modules
      fileName: 'index'
    },
    rollupOptions: {
      // CRITICAL: Do not bundle React or Core into your library
      external: ['react', 'react-dom', 'react/jsx-runtime', '@repo/core'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
});
