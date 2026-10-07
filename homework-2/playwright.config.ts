import { defineConfig, devices } from "@playwright/test";

const PORT = 3001;

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    // Default run: read-only specs. Mutation specs (create / edit / delete) run only on request.
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: ["**/*.mutation.spec.ts"] },
    { name: "mutation", use: { ...devices["Desktop Chrome"] }, testMatch: ["**/*.mutation.spec.ts"] },
  ],
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
