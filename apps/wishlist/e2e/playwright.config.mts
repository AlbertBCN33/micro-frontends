import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests of journeys that stay inside the wishlist.
 *
 * They run against the wishlist's *standalone* production build on its own port,
 * without the shell: the wishlist team can verify and ship its app on its own.
 * Journeys that cross apps live in apps/shell/e2e. Set E2E_WISHLIST_URL to run
 * the suite against a deployed wishlist.
 */
const baseURL = process.env['E2E_WISHLIST_URL'] || 'http://localhost:4302';

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
	webServer: process.env['E2E_WISHLIST_URL']
		? undefined
		: {
				// A dedicated port, so this suite never shares a server with the
				// composed app's suite (4200-4202).
				command: 'node tools/scripts/serve-dist.mjs wishlist:4302',
				url: 'http://localhost:4302/remoteEntry.json',
				reuseExistingServer: !process.env['CI'],
				cwd: workspaceRoot,
			},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
	],
});
