import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.MARKET_API_BASE_URL ?? "http://127.0.0.1:3333",
        changeOrigin: true
      }
    }
  }
});
