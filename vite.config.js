import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Dev-only proxies to bypass CORS for external AWS endpoints
      '/ext/jobs': {
        target: 'https://sbevtwyse8.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/jobs/, '/default/getalljobs'),
      },
      '/ext/filtered': {
        target: 'https://1aiwecu37g.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/filtered/, '/default/getallfilteredjobs'),
      },
      '/ext/bookmarks': {
        target: 'https://tojxfozsk2.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/bookmarks/, '/default/getbookmarkedjobs'),
      },
      '/ext/applied': {
        target: 'https://798vt2a100.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/applied/, '/default/getappliedjobs'),
      },
      '/ext/jobstatus': {
        target: 'https://87lubscaj2.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/jobstatus/, '/default/getjobstatus'),
      },
    },
  },
})
