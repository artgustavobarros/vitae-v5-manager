import { config } from 'dotenv'
import { defineConfig } from 'vitest/config'

config({ path: ['.env.local', '.env'] })

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      { test: { name: 'unit', include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'] } },
      './vitest.browser.config.ts',
    ],
  },
})
