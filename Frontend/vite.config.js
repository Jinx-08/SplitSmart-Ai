import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // AI routes → FastAPI (port 8000)
      '/api/scan-receipt': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/ai-chat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Everything else → Express backend (port 3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
