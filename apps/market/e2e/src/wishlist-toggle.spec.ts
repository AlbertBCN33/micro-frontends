import { expect, test } from '@mfe/shared-util-e2e';

test('a product saved in the catalog shows as saved on its page, after a reload', async ({
	page,
}) => {
	await page.goto('/market');
	// Locate the button through its card: its accessible name changes from
	// "Save to wishlist …" to "Saved …" once pressed.
	const card = page.locator('ui-product-card', {
		has: page.getByRole('link', { name: 'Split Ergonomic Keyboard' }),
	});
	const save = card.getByRole('button');
	await expect(save).toHaveAccessibleName(
		'Save to wishlist Split Ergonomic Keyboard',
	);

	await save.click();
	await expect(save).toHaveAttribute('aria-pressed', 'true');

	await card.getByRole('link', { name: 'Split Ergonomic Keyboard' }).click();
	await expect(page).toHaveURL('/market/split-ergo-keyboard');
	const detailToggle = page.getByRole('button', { name: 'Saved' });
	await expect(detailToggle).toHaveAttribute('aria-pressed', 'true');

	// Stored through the shared wishlist contract, so it survives a reload.
	await page.reload();
	await expect(page.getByRole('button', { name: 'Saved' })).toBeVisible();

	await page.getByRole('button', { name: 'Saved' }).click();
	await expect(
		page.getByRole('button', { name: 'Save to wishlist' }),
	).toHaveAttribute('aria-pressed', 'false');
});
