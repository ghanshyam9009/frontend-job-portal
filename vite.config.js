import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      renderLegacyChunks: true,
      modernPolyfills: ['es.array.at', 'es.promise.finally'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      targets: [
        'defaults',
        'not IE 11',
        'iOS >= 12',
        'Safari >= 12'
      ]
    })
  ],
  build: {
    target: ['es2018', 'safari13'],
    cssTarget: 'safari13'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.bigsources.in/api',
        // target:'http://18.141.113.253:/api',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
