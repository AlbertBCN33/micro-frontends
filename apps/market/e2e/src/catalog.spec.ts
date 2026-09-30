import { expect, test } from '@mfe/shared-util-e2e';

test('filters live in the URL and survive a reload', async ({ page }) => {
	await page.goto('/market');
	const search = page.getByLabel('Search');
	await search.fill('mouse');

	await expect(page).toHaveURL(/q=mouse/);
	await expect(page.getByText('2 products')).toBeVisible();
	// Search-as-you-type must never steal focus from the input.
	await expect(search).toBeFocused();

	await page.getByLabel('Sort by').selectOption('price-asc');
	await expect(page).toHaveURL(/sort=price-asc/);
	const names = page.locator('ui-product-card h2');
	await expect(names).toHaveText([
		'Featherweight Gaming Mouse',
		'Precision Ergonomic Mouse',
	]);

	await page.reload();
	await expect(page.getByLabel('Search')).toHaveValue('mouse');
	await expect(names).toHaveText([
		'Featherweight Gaming Mouse',
		'Precision Ergonomic Mouse',
	]);
});

test('an empty result offers a way out', async ({ page }) => {
	await page.goto('/market?q=toaster');
	await expect(
		page.getByText('No products match your filters.'),
	).toBeVisible();

	await page.getByRole('button', { name: 'Clear filters' }).click();
	await expect(page.getByText('18 products')).toBeVisible();
});

test('unknown products show a not-found state', async ({ page }) => {
	await page.goto('/market/does-not-exist');
	await expect(
		page.getByText("We couldn't find that product."),
	).toBeVisible();
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
