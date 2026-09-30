import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test as base } from '@playwright/test';

const REMOTE_ORIGINS = {
	market: /^http:\/\/localhost:4201\//,
	wishlist: /^http:\/\/localhost:4202\//,
} as const;

type Remote = keyof typeof REMOTE_ORIGINS;

export const test = base.extend<{
	/** URLs requested from each remote origin since the test started. */
	remoteRequests: Record<Remote, string[]>;
	/** Runs axe against WCAG 2.2 A/AA and fails on any violation. */
	expectAccessible: (page: Page) => Promise<void>;
}>({
	remoteRequests: async ({ page }, use) => {
		const seen: Record<Remote, string[]> = { market: [], wishlist: [] };
		page.on('request', (request) => {
			for (const remote of Object.keys(REMOTE_ORIGINS) as Remote[]) {
				if (REMOTE_ORIGINS[remote].test(request.url())) {
					seen[remote].push(request.url());
				}
			}
		});
		await use(seen);
	},
	// Playwright requires the destructuring pattern even when unused.
	// eslint-disable-next-line no-empty-pattern
	expectAccessible: async ({}, use) => {
		await use(async (page) => {
			const results = await new AxeBuilder({ page })
				.withTags([
					'wcag2a',
					'wcag2aa',
					'wcag21a',
					'wcag21aa',
					'wcag22aa',
				])
				.analyze();
			expect(
				results.violations.map(
					(v) => `${v.id}: ${v.help} (${v.nodes.length})`,
				),
			).toEqual([]);
		});
	},
	page: async ({ page }, use) => {
		// Every test starts from a clean device: no saved wishlist or language.
		await page.addInitScript(() => {
			if (!sessionStorage.getItem('e2e-initialized')) {
				localStorage.clear();
				sessionStorage.setItem('e2e-initialized', '1');
			}
		});
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await use(page);
		// Teardown check: any test that leaves an uncaught error fails.
		// eslint-disable-next-line playwright/no-standalone-expect
		expect(errors, 'uncaught errors in the page').toEqual([]);
	},
});

export { expect };
