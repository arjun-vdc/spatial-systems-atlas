import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // The map is served from a folder, not the site root. Without this, the build
  // writes root-absolute asset paths and the deployed page asks the site for
  // /assets/..., which is the site's own directory and does not hold them. The
  // page then returns 200 and renders nothing.
  base: '/msf/atlas/',
  plugins: [react()],
  // Stable asset names, deliberately not content-hashed. The site is deployed
  // from a manifest that lists every path it serves and deletes anything absent
  // from it. A filename that changed on every build would have to be written
  // into that manifest on every build, and the first time someone forgot, the
  // deploy would drop the bundle and serve a blank page. Paths with no cache
  // rule fall through to revalidate-on-every-request, so nothing goes stale.
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/app.[ext]',
      },
    },
  },
  server: { port: 5183, strictPort: true },
  preview: { port: 5184, strictPort: true },
})
