import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Copy only required public assets in production (exclude large videos)
    mode === 'production' && viteStaticCopy({
      targets: [
        { src: 'public/favicon/*', dest: 'favicon' },
        { src: 'public/logo.png', dest: '' },
        { src: 'public/robots.txt', dest: '' },
        { src: 'public/sw.js', dest: '' },
        { src: 'public/Humanist522.ttf', dest: '' }
      ]
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Exclude large video files from build (upload separately to hosting)
    rollupOptions: {
      external: [/\.mp4$/],
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Copy public directory but exclude videos
    copyPublicDir: true,
  },
  publicDir: mode === 'production' ? false : 'public',
}));
