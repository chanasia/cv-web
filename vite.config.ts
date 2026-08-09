import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative, not '/cv-web/': the app has no client-side routing, so relative
  // asset URLs work from any path -- a project page, a custom domain, or a
  // local file -- without this value having to track the repository name.
  base: './',
  plugins: [react(), tailwindcss()],
})
