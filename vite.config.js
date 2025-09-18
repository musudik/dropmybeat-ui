import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: ["dropmybeat.replit.app"],
    proxy: {
      "/api": {
        target: "https://dropmybeat-api.replit.app",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: ["dropmybeat.replit.app"],
  },
});
