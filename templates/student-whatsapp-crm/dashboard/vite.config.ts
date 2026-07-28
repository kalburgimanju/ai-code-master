import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite proxies /api to the NestJS backend (default :4000) in dev.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
