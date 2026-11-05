import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: { '/api': process.env.API_URL || 'http://localhost:3000' },
    watch: { usePolling: true },
  },
});
