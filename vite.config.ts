import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es',
    plugins: [react()]
  },
  optimizeDeps: {
    exclude: ['@radix-ui/react-dialog']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          embroidery: [
            './src/lib/embroidery/image-processor.ts',
            './src/lib/embroidery/contour-tracer.ts',
            './src/lib/embroidery/stitch-generator.ts'
          ]
        }
      }
    }
  }
});