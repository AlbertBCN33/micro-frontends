import { expect, test } from '@mfe/shared-util-e2e';
import { openWithSavedItems } from './support/saved-items';

test('the empty wish list has no WCAG 2.2 AA violations', async ({
	page,
	expectAccessible,
}) => {
	await page.goto('/wishlist');
	await expect(page.getByText('Your wish list is empty.')).toBeVisible();
	await expectAccessible(page);
});

test('a wish list with items has no WCAG 2.2 AA violations', async ({
	page,
	expectAccessible,
}) => {
	await openWithSavedItems(page);
	await expect(page.getByText('2 saved products')).toBeVisible();
	await expectAccessible(page);
});
