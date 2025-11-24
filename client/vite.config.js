import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use an environment override when running inside Docker compose
// Default to localhost for local development.
const proxyTarget = process.env.VITE_DEV_PROXY_TARGET || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})