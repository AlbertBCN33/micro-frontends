import { expect, test } from './support/fixtures';

test('saving in the market updates the shell and the wishlist remote', async ({
	page,
	expectAccessible,
}) => {
	await page.goto('/market');
	// Composed pages (shell chrome + remote) are audited here: issues such as
	// duplicate ids or landmarks only exist when both render together.
	await expect(page.getByText('18 products')).toBeVisible();
	await expectAccessible(page);
	const wishlistLink = page.getByTestId('wishlist-link');
	await expect(wishlistLink).toContainText('empty');

	// Locate the button through its card: its accessible name changes from
	// "Save to wishlist …" to "Saved …" once pressed.
	const card = page.locator('ui-product-card', {
		has: page.getByRole('link', { name: 'Aurora ANC Headphones' }),
	});
	const save = card.getByRole('button');
	await expect(save).toHaveAccessibleName(
		'Save to wishlist Aurora ANC Headphones',
	);
	await save.click();
	await expect(save).toHaveAttribute('aria-pressed', 'true');
	await expect(save).toHaveAccessibleName('Saved Aurora ANC Headphones');
	await expect(wishlistLink).toContainText('1 item');

	await wishlistLink.click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Wish list',
	);
	await expect(page.getByText('1 saved product')).toBeVisible();
	await expectAccessible(page);

	// Persisted across reloads (storage adapter).
	await page.reload();
	await expect(
		page.getByRole('link', { name: 'Aurora ANC Headphones' }),
	).toBeVisible();

	await page
		.getByRole('button', { name: 'Remove Aurora ANC Headphones' })
		.click();
	await expect(
		page.getByRole('status').filter({ hasText: 'removed' }),
	).toHaveText('Aurora ANC Headphones removed from your wish list.');
	await expect(wishlistLink).toContainText('empty');
	await expect(page.getByText('Your wish list is empty.')).toBeVisible();
});

test('the wishlist links back to the product in the market', async ({
	page,
}) => {
	await page.goto('/market/featherweight-gaming');
	await page.getByRole('button', { name: 'Save to wishlist' }).click();

	await page.getByTestId('wishlist-link').click();
	await page
		.getByRole('link', { name: 'Featherweight Gaming Mouse' })
		.click();

	await expect(page).toHaveURL(/\/market\/featherweight-gaming$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Featherweight Gaming Mouse',
	);
});
