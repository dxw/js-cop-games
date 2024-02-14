import { defineConfig, devices } from "@playwright/test";

// biome-ignore lint/style/noDefaultExport: this needs to be in the format expected by PlayWright
export default defineConfig({
	// Look for test files in the "tests" directory, relative to this configuration file.
	testDir: "e2e",

	// Run all tests in parallel.
	fullyParallel: true,

	// Fail the build on CI if you accidentally left test.only in the source code.
	forbidOnly: !!process.env.CI,

	// Retry on CI only.
	retries: process.env.CI ? 2 : 0,

	// Opt out of parallel tests on CI.
	workers: process.env.CI ? 1 : undefined,

	// Reporter to use
	reporter: "html",

	use: {
		// Base URL to use in actions like `await page.goto('/')`.
		// biome-ignore lint/style/useNamingConvention: the issue here is the consecutive upper case characters, but we need to follow what the library expects in this case
		baseURL: "http://localhost:8080",

		// Collect trace when retrying the failed test.
		trace: "on-first-retry",
	},
	// Configure projects for major browsers.
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: {
		command: "bun run start",
		url: "http://localhost:8080",
		reuseExistingServer: !process.env.CI,
	},
});
