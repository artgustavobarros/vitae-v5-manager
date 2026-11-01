import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { CABECALHOS_SEGURANCA } from './src/server/seguranca-http.ts'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({
      rollupConfig: { external: [/^@sentry\//] },
      compressPublicAssets: { gzip: true, brotli: true, zstd: false },
      routeRules: {
        '/**': { headers: CABECALHOS_SEGURANCA },
        '/assets/**': {
          headers: { 'cache-control': 'public, max-age=31536000, immutable' },
        },
      },
    }),
    tailwindcss(),
    tanstackStart({ server: { build: { inlineCss: true } } }),
    viteReact(),
  ],
})

export default config
