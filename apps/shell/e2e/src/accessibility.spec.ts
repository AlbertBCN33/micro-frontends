import { expect, test } from './support/fixtures';

const pages = [
	{ path: '/', heading: 'Dashboard' },
	{ path: '/market', heading: 'Market' },
	{ path: '/market/ultrawide-34', heading: '34" Ultrawide Monitor' },
	{ path: '/wishlist', heading: 'Wish list' },
	{ path: '/documentation/system-design', heading: 'Documentation' },
	{ path: '/documentation/architecture-diagram', heading: 'Documentation' },
	{ path: '/documentation/readme', heading: 'Documentation' },
	{ path: '/nope', heading: 'Page not found' },
];

for (const { path, heading } of pages) {
	test(`${path} has no WCAG 2.2 AA violations`, async ({
		page,
		expectAccessible,
	}) => {
		await page.goto(path);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			heading,
		);
		await expectAccessible(page);
	});
}

test('keyboard users can skip to content and focus follows navigation', async ({
	page,
	isMobile,
}) => {
	// eslint-disable-next-line playwright/no-skipped-test -- no keyboard on touch devices
	test.skip(isMobile, 'keyboard flow');
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Dashboard',
	);

	await page.keyboard.press('Tab');
	const skip = page.getByRole('link', { name: 'Skip to main content' });
	await expect(skip).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page.locator('main')).toBeFocused();
	await expect(page).toHaveURL('/');

	await page.getByRole('link', { name: 'Market', exact: true }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Market');
	await expect(page.locator('main')).toBeFocused();
	await expect(page).toHaveTitle('Market · MFE Store');
});
