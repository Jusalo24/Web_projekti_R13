import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log("Vite config LOADED");

export default defineConfig({
  plugins: [react()],

  server: {
    // SALLI Railwayn fronttipalvelun domaini
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'webprojektir13-client-production.up.railway.app'
    ],

    proxy: {
      "/api": {
        target: "http://server:3001",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
