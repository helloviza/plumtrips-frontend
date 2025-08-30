import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      stream: "stream-browserify",
      crypto: "crypto-browserify",
      buffer: "buffer",
      process: "process/browser",
      util: "util",
    },
  },
  define: {
    "process.env": {},
    global: "globalThis",
  },
});
