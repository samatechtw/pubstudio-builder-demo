import Vue from '@vitejs/plugin-vue'
import { defineConfig, splitVendorChunkPlugin } from 'vite'

export default defineConfig({
  root: '.',
  assetsInclude: /\.(pdf|jpg|png|webm|mp4|svg|ttf|woff|woff2)$/,
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
    },
  },
  publicDir: './src/public',
  plugins: [Vue(), splitVendorChunkPlugin()],
})
