import Vue from '@vitejs/plugin-vue'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import path from 'path'

const resolve = (p: string): string => path.resolve(__dirname, p)

export default defineConfig({
  root: '.',
  assetsInclude: /\.(pdf|jpg|png|webm|mp4|svg|ttf|woff|woff2)$/,
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@theme/': `${resolve('./node_modules/@pubstudio/builder/dist/assets/')}/`,
    },
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
