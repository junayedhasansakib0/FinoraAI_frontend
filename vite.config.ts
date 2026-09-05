import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const DEV_SERVER_PORT = 5173;
const API_ORIGIN_IN_DEV = 'http://localhost:5000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: DEV_SERVER_PORT,
    // Development only: proxying keeps the SPA and the API on one origin, so the API's
    // httpOnly cookies work without loosening its CORS allowlist. Production builds talk to
    // VITE_API_BASE_URL directly.
    proxy: {
      '/api': { target: API_ORIGIN_IN_DEV },
    },
  },
});
