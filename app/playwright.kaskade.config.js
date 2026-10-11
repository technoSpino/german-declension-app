import { defineConfig, devices } from '@playwright/test'

// E2E smoke tests for Kaskade:  npm run build && npm run test:e2e:kaskade
// Starts its own API (127.0.0.1:8001, throwaway data in app/.e2e-data) and a
// preview server (127.0.0.1:5174), so tests never touch the real ~/kaskade-data.
const DATA = '.e2e-data'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'retain-on-failure',
    // Fake microphone for the Sprechen recordings.
    permissions: ['microphone'],
    launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] }
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      // Server clock pinned to Tuesday of plan week 1, 09:30 Berlin. No H.264 conversion:
      // Playwright's Chromium can't play H.264, so test clips stay WebM.
      command: `rm -rf ${DATA} && KASKADE_OFFLINE=1 KASKADE_TRANSCODE=0 KASKADE_NOW=2026-10-13T07:30:00+00:00 KASKADE_DATA_DIR=$PWD/${DATA} ../server/.venv/bin/uvicorn kaskade.main:app --app-dir ../server --host 127.0.0.1 --port 8001`,
      url: 'http://127.0.0.1:8001/api/health',
      reuseExistingServer: false
    },
    {
      command: 'KASKADE_API=http://127.0.0.1:8001 npx vite preview --host 127.0.0.1 --port 5174 --strictPort',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false
    }
  ]
})
