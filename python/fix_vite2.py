# -*- coding: utf-8 -*-
path = r'D:\Yousseif Elshenawy projects\capstone-project\vite.config.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the proxy config with a simple proxy (no rewrite)
old = """    proxy: {
      '/api/excel': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\\/api\\/excel/, '/api'),
      },"""
new = """    proxy: {
      '/api/excel': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },"""
if old in content:
    content = content.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed proxy - removed rewrite')
else:
    print('Pattern not found')
    print('Current content:')
    print(content)