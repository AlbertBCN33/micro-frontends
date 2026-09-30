import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests of journeys that stay inside the market.
 *
 * They run against the market's *standalone* production build on its own port,
 * without the shell: the market team can verify and ship its app on its own.
 * Journeys that cross apps live in apps/shell/e2e. Set E2E_MARKET_URL to run
 * the suite against a deployed market.
 */
const baseURL = process.env['E2E_MARKET_URL'] || 'http://localhost:4301';

export default defineConfig({
	...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
	forbidOnly: !!process.env['CI'],
	retries: process.env['CI'] ? 1 : 0,
	// See apps/shell/e2e/playwright.config.mts.
	workers: 2,
	use: {
		baseURL,
		locale: 'en-US',
		trace: 'on-first-retry',
	},
	webServer: process.env['E2E_MARKET_URL']
		? undefined
		: {
				// A dedicated port, so this suite never shares a server with the
				// composed app's suite (4200-4202).
				command: 'node tools/scripts/serve-dist.mjs market:4301',
				url: 'http://localhost:4301/remoteEntry.json',
				reuseExistingServer: !process.env['CI'],
				cwd: workspaceRoot,
			},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
	],
});
