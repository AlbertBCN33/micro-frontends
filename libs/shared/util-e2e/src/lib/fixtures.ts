import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test as base } from '@playwright/test';

/**
 * Fixtures shared by every app's e2e suite:
 * - each test starts from a clean device (no saved wishlist or language);
 * - any uncaught error in the page fails the test;
 * - `expectAccessible(page)` runs axe against WCAG 2.2 A/AA.
 */
export const test = base.extend<{
	expectAccessible: (page: Page) => Promise<void>;
}>({
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
