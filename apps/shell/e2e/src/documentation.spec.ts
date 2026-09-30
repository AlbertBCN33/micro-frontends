import { expect, test } from './support/fixtures';

test('the README tab shows the project overview, without setup or screenshots', async ({
	page,
}) => {
	await page.goto('/documentation');
	await page.getByRole('link', { name: 'README' }).click();

	await expect(page).toHaveURL('/documentation/readme');
	await expect(page).toHaveTitle('README · MFE Store');
	const readme = page.locator('article.readme');
	await expect(readme).toHaveAttribute('lang', 'en');
	await expect(
		readme.getByRole('heading', { name: 'Decisions and tradeoffs' }),
	).toBeVisible();

	await expect(readme.getByText('Quick start')).toHaveCount(0);
	await expect(readme.locator('img')).toHaveCount(0);

	// Repository links point to GitHub instead of breaking inside the SPA.
	await expect(
		readme.getByRole('link', { name: 'docs/adr' }).first(),
	).toHaveAttribute(
		'href',
		'https://github.com/AlbertBCN33/micro-frontends/blob/main/docs/adr/README.md',
	);
});

test('the README tab explains it is English-only in Spanish', async ({
	page,
}) => {
	await page.goto('/documentation/readme');
	await page.getByLabel('Language').selectOption('es');

	await expect(
		page.getByText('Este documento solo está disponible en inglés.'),
	).toBeVisible();
	await expect(page.locator('article.readme')).toHaveAttribute('lang', 'en');
});
