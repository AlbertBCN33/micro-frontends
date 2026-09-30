import { Page } from '@playwright/test';

/**
 * Writes localStorage for the page's origin, then reloads so the app starts
 * from that state (e.g. a pre-filled wishlist). Call after the first goto.
 */
export async function seedLocalStorage(
	page: Page,
	entries: Record<string, unknown>,
): Promise<void> {
	await page.evaluate((values) => {
		for (const [key, value] of Object.entries(values)) {
			localStorage.setItem(key, JSON.stringify(value));
		}
	}, entries);
	await page.reload();
}
