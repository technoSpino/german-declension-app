import { defineConfig } from 'vitest/config'

// Unit tests live under src/ so Playwright (which scans ./tests) never picks them up.
export default defineConfig({
  test: {
    include: ['src/**/*.test.js'],
    environment: 'node'
  }
})
