import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// VITE_BASE lets the GitHub Pages workflow serve the app from a sub-path
// (e.g. /german-declension-app/). Netlify and local dev use the default '/'.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [vue()],
})
