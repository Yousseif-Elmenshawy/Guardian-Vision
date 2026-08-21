import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Development server configuration
  server: {
    // In development mode, Vite runs on port 5173
    // All /api requests are proxied to the Go backend on port 8081
    // This eliminates CORS issues during development
    proxy: {
      "/api": {
        target: "http://localhost:8081",
        changeOrigin: true,
        secure: false,
        // Optional: rewrite /api prefix if backend expects a different path
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },

  // Production build output
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
  },
})
