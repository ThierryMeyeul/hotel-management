import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const isProd = process.env.NODE_ENV === 'production'

// https://vite.dev/config/
export default defineConfig({
  // use the Django static path in production so files are served at /static/frontend/
  base: isProd ? '/static/frontend/' : '/',
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Proxy API calls to the Django backend during development
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    cors: {
      origin: 'http://localhost:8000',
    }
  },
  build: {
    // Output directly into Django staticfiles so you can serve the frontend from Django in production
    outDir: '../backend/static/frontend',
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
})
