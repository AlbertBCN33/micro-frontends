import { expect, test } from './support/fixtures';

test('the language choice applies to the shell and every remote', async ({
	page,
}) => {
	await page.goto('/market');
	await page.getByLabel('Language').selectOption('es');

	// Shell strings, remote strings and <html lang> switch together.
	await expect(
		page.getByRole('link', { name: 'Mercado', exact: true }),
	).toBeVisible();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mercado');
	await expect(page.locator('html')).toHaveAttribute('lang', 'es');
	await expect(page.getByText('18 productos')).toBeVisible();
	await expect(page.getByText('249,00 €')).toBeVisible();

	// A remote loaded *after* the switch starts in Spanish too.
	await page.getByTestId('wishlist-link').click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Deseados',
	);

	// The choice is remembered.
	await page.reload();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Deseados',
	);
});

test('each app serves its own translation files', async ({ page }) => {
	// Chunk names are a bundler detail, so identify translation chunks by
	// content: a key only the shell defines, and one only the market defines.
	const servedBy = { shell: new Set<string>(), market: new Set<string>() };
	const pending: Promise<void>[] = [];
	page.on('response', (response) => {
		if (!response.url().endsWith('.js')) return;
		pending.push(
			response.text().then(
				(body) => {
					const origin = new URL(response.url()).origin;
					if (body.includes('SKIP_TO_CONTENT'))
						servedBy.shell.add(origin);
					if (body.includes('SEARCH_PLACEHOLDER'))
						servedBy.market.add(origin);
				},
				() => undefined,
			),
		);
	});

	await page.goto('/market');
	await expect(page.getByText('18 products')).toBeVisible();
	await Promise.all(pending);

	expect([...servedBy.shell]).toEqual(['http://localhost:4200']);
	expect([...servedBy.market]).toEqual(['http://localhost:4201']);
});
