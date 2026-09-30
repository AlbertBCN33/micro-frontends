import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
import { ProductDetailPage } from './product-detail-page';

async function render(url: string, catalog = createFakeCatalog()) {
	TestBed.configureTestingModule({
		providers: [
			provideRootTranslations(
				(lang) => import(`../../assets/i18n/${lang}.json`),
			),
			{
				provide: WishlistStorage,
				useValue: new InMemoryWishlistStorage(),
			},
			provideRouter([
				{
					path: 'market/:id',
					component: ProductDetailPage,
					providers: [{ provide: ProductCatalog, useValue: catalog }],
				},
			]),
		],
	});
	await firstValueFrom(TestBed.inject(TranslateService).use('en'));
	const harness = await RouterTestingHarness.create(url);
	return { harness, el: harness.routeNativeElement as HTMLElement };
}

describe('ProductDetailPage', () => {
	it('renders the product from the :id param', async () => {
		const { el } = await render('/market/precision-mouse');

		expect(el.querySelector('h1')?.textContent).toBe('Precision Mouse');
		expect(el.textContent).toContain('€79.00');
		expect(el.textContent).toContain('Rated 4.6 out of 5');
		expect(el.textContent).toContain('Vertical grip.');
	});

	it('shows the description in the active language', async () => {
		const { el, harness } = await render('/market/precision-mouse');

		await firstValueFrom(TestBed.inject(TranslateService).use('es'));
		harness.detectChanges();

		expect(el.textContent).toContain('Agarre vertical.');
		// Intl separates the currency with a non-breaking space.
		expect(el.textContent).toMatch(/79,00\s€/);
		// Numbers inside messages are localized too (ICU {rating, number}).
		expect(el.textContent).toContain('Valoración de 4,6 sobre 5');
	});

	it('toggles the product in the shared wishlist', async () => {
		const { el, harness } = await render('/market/aurora');
		const button = el.querySelector<HTMLButtonElement>(
			'button[aria-pressed]',
		)!;

		button.click();
		harness.detectChanges();

		expect(TestBed.inject(WishlistStore).items()[0]).toMatchObject({
			id: 'aurora',
			name: 'Aurora Headphones',
			price: 249,
		});
		expect(button.getAttribute('aria-pressed')).toBe('true');
	});

	it('shows a not-found state for unknown ids', async () => {
		const { el } = await render('/market/does-not-exist');

		expect(el.querySelector('h1')).toBeNull();
		expect(el.querySelector('[role="status"]')?.textContent).toContain(
			"We couldn't find that product.",
		);
	});

	it('waits for the catalog before deciding a product is missing', async () => {
		const catalog = createFakeCatalog([]);
		catalog.isLoading.set(true);
		const { el } = await render('/market/aurora', catalog);

		expect(el.textContent).toContain('Loading products');
		expect(el.textContent).not.toContain("couldn't find");
	});
});
