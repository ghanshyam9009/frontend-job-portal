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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxuaWtoaWxcXFxcTmV3LUpvYi1wb3J0YWxcXFxcZnJvbnRlbmQtam9iLXBvcnRhbFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcbmlraGlsXFxcXE5ldy1Kb2ItcG9ydGFsXFxcXGZyb250ZW5kLWpvYi1wb3J0YWxcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL25pa2hpbC9OZXctSm9iLXBvcnRhbC9mcm9udGVuZC1qb2ItcG9ydGFsL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCBsZWdhY3kgZnJvbSAnQHZpdGVqcy9wbHVnaW4tbGVnYWN5J1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIHRhaWx3aW5kY3NzKCksXHJcbiAgICBsZWdhY3koe1xyXG4gICAgICByZW5kZXJMZWdhY3lDaHVua3M6IHRydWUsXHJcbiAgICAgIG1vZGVyblBvbHlmaWxsczogWydlcy5hcnJheS5hdCcsICdlcy5wcm9taXNlLmZpbmFsbHknXSxcclxuICAgICAgYWRkaXRpb25hbExlZ2FjeVBvbHlmaWxsczogWydyZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUnXSxcclxuICAgICAgdGFyZ2V0czogW1xyXG4gICAgICAgICdkZWZhdWx0cycsXHJcbiAgICAgICAgJ25vdCBJRSAxMScsXHJcbiAgICAgICAgJ2lPUyA+PSAxMicsXHJcbiAgICAgICAgJ1NhZmFyaSA+PSAxMidcclxuICAgICAgXVxyXG4gICAgfSlcclxuICBdLFxyXG4gIGJ1aWxkOiB7XHJcbiAgICB0YXJnZXQ6IFsnZXMyMDE4JywgJ3NhZmFyaTEzJ10sXHJcbiAgICBjc3NUYXJnZXQ6ICdzYWZhcmkxMydcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9hcGkuYmlnc291cmNlcy5pbi9hcGknLFxyXG4gICAgICAgIC8vIHRhcmdldDonaHR0cDovLzE4LjE0MS4xMTMuMjUzOi9hcGknLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgIC8vIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1YsU0FBUyxvQkFBb0I7QUFDL1csT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sWUFBWTtBQUduQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixPQUFPO0FBQUEsTUFDTCxvQkFBb0I7QUFBQSxNQUNwQixpQkFBaUIsQ0FBQyxlQUFlLG9CQUFvQjtBQUFBLE1BQ3JELDJCQUEyQixDQUFDLDZCQUE2QjtBQUFBLE1BQ3pELFNBQVM7QUFBQSxRQUNQO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVEsQ0FBQyxVQUFVLFVBQVU7QUFBQSxJQUM3QixXQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBO0FBQUEsUUFFUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUE7QUFBQSxNQUVWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
