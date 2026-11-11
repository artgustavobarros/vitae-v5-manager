import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  server: { preTransformRequests: false },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react', 'react-dom/client', 'react/jsx-runtime', 'react/jsx-dev-runtime',
      '@tanstack/react-router', '@dnd-kit/dom', '@dnd-kit/dom/sortable', '@dnd-kit/react', '@dnd-kit/react/sortable',
      'cn', 'sonner', 'radix-ui', 'embla-carousel-react', 'lucide-react',
    ],
  },
  test: {
    name: 'browser',
    include: ['src/**/*.browser.test.tsx'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium', name: 'browser-celular', viewport: { width: 390, height: 844 } },
        { browser: 'chromium', name: 'browser-desktop', viewport: { width: 1440, height: 1000 } },
      ],
      commands: {
        async iniciarArraste({ page, iframe }, seletor: string) {
          const caixa = await iframe.locator(seletor).first().boundingBox()
          if (!caixa) throw new Error('Alça de reordenação não encontrada')
          const x = caixa.x + caixa.width / 2, y = caixa.y + caixa.height / 2
          await page.mouse.move(x, y)
          await page.mouse.down()
          await page.mouse.move(x + 16, y, { steps: 4 })
        },
        async moverNaBorda({ page, iframe }, direcao: 'esquerda' | 'direita') {
          const caixa = await iframe.locator('.carrossel-combate > div:last-child').boundingBox()
          if (!caixa) throw new Error('Faixa de participantes não encontrada')
          await page.mouse.move(direcao === 'direita' ? caixa.x + caixa.width - 12 : caixa.x + 12,
            caixa.y + 64, { steps: 8 })
        },
        async soltarArraste({ page }) { await page.mouse.up() },
      },
    },
  },
})
