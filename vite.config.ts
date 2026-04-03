import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

const repoName = 'subscription_manager';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: `/${repoName}/`,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    // Preserve local dev behavior while keeping the production build static-host friendly.
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
