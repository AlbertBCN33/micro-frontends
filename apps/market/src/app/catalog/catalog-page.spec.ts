import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
	InMemoryWishlistStorage,
	WishlistStorage,
	WishlistStore,
} from '@mfe/shared-data-access-wishlist';
import { provideRootTranslations } from '@mfe/shared-util-i18n';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { ProductCatalog } from '../data/product-catalog';
import { createFakeCatalog } from '../testing/fake-catalog';
import { CatalogPage } from './catalog-page';

async function render(url = '/market', catalog = createFakeCatalog()) {
	TestBed.configureTestingModule({
		providers: [
			// Real English file: tests fail if a key used by the page is missing.
			provideRootTranslations(
				(lang) => import(`../../assets/i18n/${lang}.json`),
			),
			{
				provide: WishlistStorage,
				useValue: new InMemoryWishlistStorage(),
			},
			provideRouter([
				{
					path: 'market',
					component: CatalogPage,
					providers: [{ provide: ProductCatalog, useValue: catalog }],
				},
			]),
		],
	});
	await firstValueFrom(TestBed.inject(TranslateService).use('en'));
	const harness = await RouterTestingHarness.create(url);
	const el = harness.routeNativeElement as HTMLElement;
	const names = () =>
		[...el.querySelectorAll('ui-product-card h2')].map((h) =>
			h.textContent?.trim(),
		);
	return { harness, el, catalog, names };
}

describe('CatalogPage', () => {
	it('renders the filtered results from the URL', async () => {
		const { el, names } = await render('/market?q=mouse&sort=price-asc');

		expect(names()).toEqual(['Gaming Mouse', 'Precision Mouse']);
		expect(el.querySelector('[role="status"]')?.textContent).toContain(
			'2 products',
		);
		expect(
			el.querySelector<HTMLInputElement>('#catalog-search')?.value,
		).toBe('mouse');
		expect(
			el.querySelector<HTMLSelectElement>('#catalog-sort')?.value,
		).toBe('price-asc');
	});

	it('writes the search to the URL after debouncing', async () => {
		const { el, harness } = await render();
		const input = el.querySelector<HTMLInputElement>('#catalog-search');

		input!.value = 'aurora';
		input!.dispatchEvent(new Event('input'));

		await vi.waitFor(() =>
			expect(TestBed.inject(Router).url).toBe('/market?q=aurora'),
		);
		harness.detectChanges();
		expect(el.querySelectorAll('ui-product-card')).toHaveLength(1);
	});

	it('toggles a product in the shared wishlist', async () => {
		const { el, harness } = await render();
		const button = el.querySelector<HTMLButtonElement>(
			'ui-product-card button',
		)!;
		expect(button.getAttribute('aria-pressed')).toBe('false');

		button.click();
		harness.detectChanges();

		expect(TestBed.inject(WishlistStore).has('aurora')).toBe(true);
		expect(button.getAttribute('aria-pressed')).toBe('true');
		expect(button.textContent).toContain('Saved');
	});

	it('shows an error with a retry', async () => {
		const catalog = createFakeCatalog();
		catalog.error.set(new Error('500'));
		const { el } = await render('/market', catalog);

		expect(el.querySelector('[role="alert"]')?.textContent).toContain(
			'The catalog could not be loaded.',
		);
		el.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
		expect(catalog.reload).toHaveBeenCalled();
	});

	it('offers to clear filters when nothing matches', async () => {
		const { el } = await render('/market?q=toaster&category=mice');

		expect(el.textContent).toContain('No products match your filters.');
		el.querySelector<HTMLButtonElement>('ui-state-message button')!.click();

		await vi.waitFor(() =>
			expect(TestBed.inject(Router).url).toBe('/market'),
		);
	});
});
