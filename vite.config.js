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
      '/Recruiter': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/students': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      // Admin External Services
      '/ext/admin/edit': {
        target: 'https://pxp7c1q6w0.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/admin\/edit/, ''),
      },
      '/ext/admin/close': {
        target: 'https://4ua54ajyt2.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/admin\/close/, ''),
      },
      '/ext/admin/post': {
        target: 'https://dpe8786t44.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/admin\/post/, ''),
      },
      '/ext/admin/app-approve': {
        target: 'https://w6j19ipnk8.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/admin\/app-approve/, ''),
      },
      '/ext/admin/app-status': {
        target: 'https://xnaf1mh5p2.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/admin\/app-status/, ''),
      },
      // Recruiter External Services
      '/ext/recruiter/jobs': {
        target: 'https://3lfruhyo2j.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/recruiter\/jobs/, ''),
      },
      '/ext/recruiter/applicants': {
        target: 'https://fab65y8p6d.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/recruiter\/applicants/, ''),
      },
      '/ext/recruiter/actions': {
        target: 'https://qghn0cpfqj.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/recruiter\/actions/, ''),
      },
      '/ext/recruiter/job-close': {
        target: 'https://wxxi8h89m5.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/recruiter\/job-close/, ''),
      },
      // Candidate External Services (Bookmark)
      '/ext/candidate/bookmark': {
        target: 'https://jslq70120m.execute-api.ap-southeast-1.amazonaws.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/ext\/candidate\/bookmark/, ''),
      },
    },
  },
})
