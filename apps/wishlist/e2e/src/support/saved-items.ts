import { Page } from '@playwright/test';
import { seedLocalStorage } from '@mfe/shared-util-e2e';

// The wishlist runs without the market here, so images are inline.
const IMAGE =
	'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="200"/%3E';

/** Items as the market would have saved them (the shared WishlistItem contract). */
export const SAVED_ITEMS = [
	{
		id: 'aurora-anc-headphones',
		name: 'Aurora ANC Headphones',
		price: 249,
		currency: 'EUR',
		imageUrl: IMAGE,
		addedAt: '2026-09-01T10:00:00.000Z',
	},
	{
		id: 'precision-ergo-mouse',
		name: 'Precision Ergonomic Mouse',
		price: 79,
		currency: 'EUR',
		imageUrl: IMAGE,
		addedAt: '2026-09-02T10:00:00.000Z',
	},
];

/** Opens the wishlist with items already saved on this device. */
export async function openWithSavedItems(page: Page, items = SAVED_ITEMS) {
	await page.goto('/wishlist');
	await seedLocalStorage(page, { 'mfe.wishlist.v1': items });
}
