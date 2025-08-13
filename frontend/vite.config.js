import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/e-commerce/', // Changed back to '/e-commerce/' since that's the actual deployment path
  css: {
    postcss: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  // Remove server proxy for production build
})
