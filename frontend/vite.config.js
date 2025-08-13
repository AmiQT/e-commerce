import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Changed from '/e-commerce/' to '/' since it's deployed at root
  css: {
    postcss: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  // Remove server proxy for production build
})
