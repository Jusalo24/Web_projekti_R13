import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

console.log("Vite config LOADED");


// https://vite.dev/config/

export default {
  server: {
    proxy: {
      "/api": {
        target: "http://server:3001",
        changeOrigin: true,
        secure: false
      }
    }
  }
}