import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': '../../src',
    },
  },
  optimizeDeps: {
    exclude: ['tty'],
  },
  server: {
    cors: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['../..'],
    },
  },
  plugins: [vue()],
})
