# -*- coding: utf-8 -*-
import os

path = r'D:\Yousseif Elshenawy projects\capstone-project\vite.config.js'
content = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/excel': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/excel/, '/api'),
      },
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
})
"""
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('vite.config.js updated')