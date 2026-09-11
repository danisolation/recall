import { defineConfig, devices } from "@playwright/test";

const WEB_PORT = 3100;
const API_PORT = 3101;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter @danisolation-recall/api start",
      env: {
        NODE_ENV: "development",
        PORT: String(API_PORT),
        DATABASE_URL:
          process.env.DATABASE_URL ??
          "postgresql://recall:recall@localhost:5432/recall",
        // The journey logs in repeatedly; the default 5/min would throttle it.
        THROTTLE_LIMIT: "1000",
      },
      url: `http://localhost:${API_PORT}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @danisolation-recall/web dev",
      env: {
        NODE_ENV: "development",
        PORT: String(WEB_PORT),
        API_ORIGIN: `http://localhost:${API_PORT}`,
      },
      url: `http://localhost:${WEB_PORT}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
