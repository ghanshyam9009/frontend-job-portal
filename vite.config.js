import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import babel from '@rollup/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({
      babelHelpers: 'runtime',
      extensions: ['.js', '.jsx'],
      include: ['src/**/*'],
      exclude: ['node_modules/**'],
      configFile: './babel.config.cjs',
    }),
    legacy({
      renderLegacyChunks: true,
      modernPolyfills: ['es.array.at', 'es.promise.finally'],
      additionalLegacyPolyfills: [
        // Core runtime polyfills
        'regenerator-runtime/runtime',
        // API polyfills commonly missing in IE11
        'whatwg-fetch',
        'custom-event',
        // Common built-in methods used in app code / deps
        'core-js/es/promise',
        'core-js/es/string/includes',
        'core-js/es/array/includes',
        'core-js/es/object/assign',
      ],
      targets: [
        'defaults',
        'IE 11',
        'iOS >= 12',
        'Safari >= 12'
      ]
    })
  ],
  build: {
    target: ['es2015', 'safari13'],
    cssTarget: 'ie11'
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
