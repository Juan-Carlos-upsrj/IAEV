import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/iaev/', // Correct base path for https://domain.com/iaev/
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});