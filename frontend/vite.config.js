import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/e-commerce/', // Change this to match your repository name
  css: {
    postcss: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  // Remove server proxy for production build
})
