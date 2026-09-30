import { expect, test } from '@mfe/shared-util-e2e';

const pages = [
	{ path: '/market', heading: 'Market' },
	{ path: '/market/ultrawide-34', heading: '34" Ultrawide Monitor' },
	{ path: '/market?q=toaster', heading: 'Market' },
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

test('an unknown product page has no WCAG 2.2 AA violations', async ({
	page,
	expectAccessible,
}) => {
	await page.goto('/market/does-not-exist');
	await expect(
		page.getByText("We couldn't find that product."),
	).toBeVisible();
	await expectAccessible(page);
});
