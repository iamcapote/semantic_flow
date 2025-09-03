
import { fileURLToPath, URL } from "url";
import { createRequire } from 'module';
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
const require = createRequire(import.meta.url);

export default defineConfig(({ mode }) => ({
  server: process.env.VITE_STANDALONE === '1' ? {
    host: "::",
    port: 8081,
    strictPort: true,
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  } : undefined,
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  css: {
    postcss: {
      plugins: [
        require('tailwindcss')(),
        require('autoprefixer')(),
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "lib",
        replacement: resolve(__dirname, "lib"),
      },
    ],
  },
}));
