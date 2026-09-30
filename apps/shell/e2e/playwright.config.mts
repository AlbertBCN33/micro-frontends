import { workspaceRoot } from '@nx/devkit';
import { nxE2EPreset } from '@nx/playwright/preset';
import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests of journeys across apps, and of the shell's own pages,
 * on the *composed* app: shell plus both remotes. Journeys that stay inside a
 * remote live in that remote's e2e project.
 *
 * They run against production builds served the way the static host serves
 * them (see tools/scripts/serve-dist.mjs), so they exercise real federation:
 * import maps, cross-origin remotes and hashed translation chunks. Set E2E_SHELL_URL
 * to run the same suite against a deployed preview.
 */
const baseURL = process.env['E2E_SHELL_URL'] || 'http://localhost:4200';

export default defineConfig({
	...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
	forbidOnly: !!process.env['CI'],
	retries: process.env['CI'] ? 1 : 0,
	// Each worker launches its own Chromium. Launching 4+ at once on Windows
	// stalled first paint by ~10s (1 browser with 4 contexts: 0.3s), so keep
	// it at 2: stable, and still well under a minute for the whole suite.
	workers: 2,
	use: {
		baseURL,
		locale: 'en-US',
		trace: 'on-first-retry',
	},
	webServer: process.env['E2E_SHELL_URL']
		? undefined
		: {
				command: 'node tools/scripts/serve-dist.mjs',
				url: 'http://localhost:4202/remoteEntry.json',
				reuseExistingServer: !process.env['CI'],
				cwd: workspaceRoot,
			},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
	],
});
