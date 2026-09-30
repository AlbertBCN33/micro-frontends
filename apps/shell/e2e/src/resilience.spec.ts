import { expect, test } from './support/fixtures';

test('a broken remote is contained to its own section', async ({ page }) => {
	await page.route('http://localhost:4202/**', (route) => route.abort());

	await page.goto('/wishlist');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'This section is unavailable',
	);
	await expect(page.getByRole('alert')).toContainText('"wishlist"');

	// Navigation and the other remote keep working.
	await page.getByRole('link', { name: 'Market', exact: true }).click();
	await expect(page.getByText('18 products')).toBeVisible();
});

test('a failing catalog request shows a retry', async ({ page }) => {
	let fail = true;
	await page.route('**/api/products.json', (route) =>
		fail ? route.fulfill({ status: 500 }) : route.continue(),
	);

	await page.goto('/market');
	await expect(page.getByRole('alert')).toHaveText(
		/The catalog could not be loaded/,
	);

	fail = false;
	await page.getByRole('button', { name: 'Try again' }).click();
	await expect(page.getByText('18 products')).toBeVisible();
});
