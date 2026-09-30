import { expect, test } from '@mfe/shared-util-e2e';
import { openWithSavedItems } from './support/saved-items';

test('lists saved products with a total, and removes one with an announcement', async ({
	page,
}) => {
	await openWithSavedItems(page);

	await expect(page.getByText('2 saved products')).toBeVisible();
	await expect(page.locator('.total')).toContainText('€328.00');

	await page
		.getByRole('button', { name: 'Remove Aurora ANC Headphones' })
		.click();

	await expect(
		page.getByRole('status').filter({ hasText: 'removed' }),
	).toHaveText('Aurora ANC Headphones removed from your wish list.');
	await expect(page.getByText('1 saved product')).toBeVisible();
	await expect(page.locator('.total')).toContainText('€79.00');

	// The removal is persisted.
	await page.reload();
	await expect(
		page.getByRole('link', { name: 'Aurora ANC Headphones' }),
	).toHaveCount(0);
});

test('clearing the list shows the empty state with a way back to the market', async ({
	page,
}) => {
	await openWithSavedItems(page);

	await page.getByRole('button', { name: 'Clear wish list' }).click();

	await expect(page.getByText('Your wish list is empty.')).toBeVisible();
	// Routes are the contract between apps: the market is mounted at /market.
	await expect(
		page.getByRole('link', { name: 'Browse the market' }),
	).toHaveAttribute('href', '/market');
});

test('saved products link to their page in the market', async ({ page }) => {
	await openWithSavedItems(page);

	await expect(
		page.getByRole('link', { name: 'Precision Ergonomic Mouse' }),
	).toHaveAttribute('href', '/market/precision-ergo-mouse');
});
