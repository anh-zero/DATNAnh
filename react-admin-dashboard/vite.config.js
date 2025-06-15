import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'tailwindcss/version.js': path.resolve(__dirname, 'src/mocks/tailwindcss/version.js')
    },
  },
  optimizeDeps: {
    exclude: ['tailwindcss/version.js']
  },
  build: {
    commonjsOptions: {
      exclude: ['tailwindcss/version.js']
    }
  }
});
