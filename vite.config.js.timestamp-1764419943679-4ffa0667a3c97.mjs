// vite.config.js
import { defineConfig } from "file:///C:/Users/nikhil/New-Job-portal/frontend-job-portal/node_modules/vite/dist/node/index.js";
import tailwindcss from "file:///C:/Users/nikhil/New-Job-portal/frontend-job-portal/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///C:/Users/nikhil/New-Job-portal/frontend-job-portal/node_modules/@vitejs/plugin-react/dist/index.js";
import legacy from "file:///C:/Users/nikhil/New-Job-portal/frontend-job-portal/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    legacy({
      renderLegacyChunks: true,
      modernPolyfills: ["es.array.at", "es.promise.finally"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      targets: [
        "defaults",
        "not IE 11",
        "iOS >= 12",
        "Safari >= 12"
      ]
    })
  ],
  build: {
    target: ["es2018", "safari13"],
    cssTarget: "safari13"
  },
  server: {
    proxy: {
      "/api": {
        target: "https://api.bigsources.in/api",
        // target:'http://18.141.113.253:/api',
        changeOrigin: true,
        secure: false
        // rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
});
export {
  vite_config_default as default
};
