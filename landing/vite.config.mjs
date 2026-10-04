import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// .mjs (and no "type": "module" in package.json) because the Vercel functions in api/ are CommonJS.
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 5173 stays free for the EnviGuide platform, which the /login page embeds during local dev.
    port: 5174,
    watch: { ignored: ['**/Enviguide-IHM/**'] },
  },
  // Only scan our own entry; otherwise Vite crawls the nested Enviguide-IHM app's index.html too.
  optimizeDeps: { entries: ['index.html'] },
  build: {
    // vercel.json proxies /assets/* to the EnviGuide platform, so keep our bundles out of that path.
    assetsDir: 'static',
  },
})
