import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "src/views",
  build: {
    outDir: "../../public/dist",
    emptyOutDir: true,
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/signup": "http://localhost:3000",
      "/login": "http://localhost:3000",
      "/user": "http://localhost:3000",
    },
    historyApiFallback: true,
  },
});
