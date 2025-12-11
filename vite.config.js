import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: '/vue-project/',
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/naver': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/naver/, ''),
        secure: false,
      },
      '/google-news': {
        target: 'https://news.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/google-news/, ''),
        secure: false,
      },
      '/naver-weather': {
        target: 'https://search.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/naver-weather/, ''),
        secure: false,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      '/api/pexels': {
        target: 'https://api.pexels.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pexels/, ''),
        secure: false,
      },
    },
  },
})
