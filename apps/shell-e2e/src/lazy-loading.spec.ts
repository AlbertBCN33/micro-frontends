import { expect, test } from './support/fixtures';

test.describe('remote lazy loading', () => {
	test('the dashboard downloads nothing from any remote', async ({
		page,
		remoteRequests,
	}) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'Dashboard',
		);
		// Startup requests (import map, manifest) all finish before the app
		// renders; anything a remote would add must already have been issued.
		await page.waitForLoadState('load');

		expect(remoteRequests.market).toEqual([]);
		expect(remoteRequests.wishlist).toEqual([]);
		await expect(page.getByTestId('remote-status-market')).toContainText(
			'not loaded yet',
		);
	});

	test('visiting a remote downloads only that remote', async ({
		page,
		remoteRequests,
	}) => {
		await page.goto('/');
		await page.getByRole('link', { name: 'Market', exact: true }).click();

		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'Market',
		);
		expect(
			remoteRequests.market.some((url) =>
				url.endsWith('/remoteEntry.json'),
			),
		).toBe(true);
		expect(remoteRequests.wishlist).toEqual([]);

		await page.getByRole('link', { name: 'Dashboard' }).click();
		await expect(page.getByTestId('remote-status-market')).toContainText(
			/^\s*market\s+loaded\s*$/,
		);
		await expect(page.getByTestId('remote-status-wishlist')).toContainText(
			'not loaded yet',
		);
	});
});
