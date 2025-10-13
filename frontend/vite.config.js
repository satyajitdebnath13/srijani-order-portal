import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    // Enable SPA fallback for development
    historyApiFallback: true
  },
  build: {
    // Ensure proper SPA routing in production
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});

