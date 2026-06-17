import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080/ProFitSuppsDB',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: 'http://localhost:8080/ProFitSuppsDB',
        changeOrigin: true,
        secure: false,
      },
      '/login/oauth2': {
        target: 'http://localhost:8080/ProFitSuppsDB',
        changeOrigin: true,
        secure: false,
      },
      '/auth-callback': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
        bypass: (req, res) => {
          req.url = '/index.html';
        },
      },
      '/reset-password': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
        bypass: (req, res) => {
          req.url = '/index.html';
        },
      },
      '/payment-result': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
        bypass: (req, res) => {
          req.url = '/index.html';
        },
      },
    },
  },
})
