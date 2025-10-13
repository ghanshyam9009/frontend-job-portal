import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://18.141.113.253/api',
        // target: 'http://localhost:4000/api',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})    
