import { config } from 'dotenv'
import { defineConfig } from 'vitest/config'

config({ path: ['.env.local', '.env'] })

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
})
