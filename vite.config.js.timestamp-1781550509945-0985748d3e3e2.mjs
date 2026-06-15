// vite.config.js
import { defineConfig } from "file:///C:/Users/Dell/frontend-job-portal/node_modules/vite/dist/node/index.js";
import tailwindcss from "file:///C:/Users/Dell/frontend-job-portal/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///C:/Users/Dell/frontend-job-portal/node_modules/@vitejs/plugin-react/dist/index.js";
import legacy from "file:///C:/Users/Dell/frontend-job-portal/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import babel from "file:///C:/Users/Dell/frontend-job-portal/node_modules/@rollup/plugin-babel/dist/es/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({
      babelHelpers: "runtime",
      extensions: [".js", ".jsx"],
      include: ["src/**/*"],
      exclude: ["node_modules/**"],
      configFile: "./babel.config.cjs"
    }),
    legacy({
      renderLegacyChunks: true,
      modernPolyfills: ["es.array.at", "es.promise.finally"],
      additionalLegacyPolyfills: [
        // Core runtime polyfills
        "regenerator-runtime/runtime",
        // API polyfills commonly missing in IE11
        "whatwg-fetch",
        "custom-event",
        // Common built-in methods used in app code / deps
        "core-js/es/promise",
        "core-js/es/string/includes",
        "core-js/es/array/includes",
        "core-js/es/object/assign"
      ],
      targets: [
        "defaults",
        "IE 11",
        "iOS >= 12",
        "Safari >= 12"
      ]
    })
  ],
  build: {
    target: ["es2015", "safari13"],
    cssTarget: "ie11"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxEZWxsXFxcXGZyb250ZW5kLWpvYi1wb3J0YWxcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXERlbGxcXFxcZnJvbnRlbmQtam9iLXBvcnRhbFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvRGVsbC9mcm9udGVuZC1qb2ItcG9ydGFsL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCBsZWdhY3kgZnJvbSAnQHZpdGVqcy9wbHVnaW4tbGVnYWN5J1xyXG5pbXBvcnQgYmFiZWwgZnJvbSAnQHJvbGx1cC9wbHVnaW4tYmFiZWwnXHJcblxyXG4vLyBodHRwczovL3ZpdGUuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgdGFpbHdpbmRjc3MoKSxcclxuICAgIGJhYmVsKHtcclxuICAgICAgYmFiZWxIZWxwZXJzOiAncnVudGltZScsXHJcbiAgICAgIGV4dGVuc2lvbnM6IFsnLmpzJywgJy5qc3gnXSxcclxuICAgICAgaW5jbHVkZTogWydzcmMvKiovKiddLFxyXG4gICAgICBleGNsdWRlOiBbJ25vZGVfbW9kdWxlcy8qKiddLFxyXG4gICAgICBjb25maWdGaWxlOiAnLi9iYWJlbC5jb25maWcuY2pzJyxcclxuICAgIH0pLFxyXG4gICAgbGVnYWN5KHtcclxuICAgICAgcmVuZGVyTGVnYWN5Q2h1bmtzOiB0cnVlLFxyXG4gICAgICBtb2Rlcm5Qb2x5ZmlsbHM6IFsnZXMuYXJyYXkuYXQnLCAnZXMucHJvbWlzZS5maW5hbGx5J10sXHJcbiAgICAgIGFkZGl0aW9uYWxMZWdhY3lQb2x5ZmlsbHM6IFtcclxuICAgICAgICAvLyBDb3JlIHJ1bnRpbWUgcG9seWZpbGxzXHJcbiAgICAgICAgJ3JlZ2VuZXJhdG9yLXJ1bnRpbWUvcnVudGltZScsXHJcbiAgICAgICAgLy8gQVBJIHBvbHlmaWxscyBjb21tb25seSBtaXNzaW5nIGluIElFMTFcclxuICAgICAgICAnd2hhdHdnLWZldGNoJyxcclxuICAgICAgICAnY3VzdG9tLWV2ZW50JyxcclxuICAgICAgICAvLyBDb21tb24gYnVpbHQtaW4gbWV0aG9kcyB1c2VkIGluIGFwcCBjb2RlIC8gZGVwc1xyXG4gICAgICAgICdjb3JlLWpzL2VzL3Byb21pc2UnLFxyXG4gICAgICAgICdjb3JlLWpzL2VzL3N0cmluZy9pbmNsdWRlcycsXHJcbiAgICAgICAgJ2NvcmUtanMvZXMvYXJyYXkvaW5jbHVkZXMnLFxyXG4gICAgICAgICdjb3JlLWpzL2VzL29iamVjdC9hc3NpZ24nLFxyXG4gICAgICBdLFxyXG4gICAgICB0YXJnZXRzOiBbXHJcbiAgICAgICAgJ2RlZmF1bHRzJyxcclxuICAgICAgICAnSUUgMTEnLFxyXG4gICAgICAgICdpT1MgPj0gMTInLFxyXG4gICAgICAgICdTYWZhcmkgPj0gMTInXHJcbiAgICAgIF1cclxuICAgIH0pXHJcbiAgXSxcclxuICBidWlsZDoge1xyXG4gICAgdGFyZ2V0OiBbJ2VzMjAxNScsICdzYWZhcmkxMyddLFxyXG4gICAgY3NzVGFyZ2V0OiAnaWUxMSdcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9hcGkuYmlnc291cmNlcy5pbi9hcGknLFxyXG4gICAgICAgIC8vIHRhcmdldDonaHR0cDovLzE4LjE0MS4xMTMuMjUzOi9hcGknLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgIC8vIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlIsU0FBUyxvQkFBb0I7QUFDMVQsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sWUFBWTtBQUNuQixPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLE1BQ0osY0FBYztBQUFBLE1BQ2QsWUFBWSxDQUFDLE9BQU8sTUFBTTtBQUFBLE1BQzFCLFNBQVMsQ0FBQyxVQUFVO0FBQUEsTUFDcEIsU0FBUyxDQUFDLGlCQUFpQjtBQUFBLE1BQzNCLFlBQVk7QUFBQSxJQUNkLENBQUM7QUFBQSxJQUNELE9BQU87QUFBQSxNQUNMLG9CQUFvQjtBQUFBLE1BQ3BCLGlCQUFpQixDQUFDLGVBQWUsb0JBQW9CO0FBQUEsTUFDckQsMkJBQTJCO0FBQUE7QUFBQSxRQUV6QjtBQUFBO0FBQUEsUUFFQTtBQUFBLFFBQ0E7QUFBQTtBQUFBLFFBRUE7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRLENBQUMsVUFBVSxVQUFVO0FBQUEsSUFDN0IsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQTtBQUFBLFFBRVIsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBO0FBQUEsTUFFVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
