import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
	InMemoryWishlistStorage,
	WishlistStorage,
	WishlistStore,
} from '@mfe/shared-data-access-wishlist';
import { provideRootTranslations } from '@mfe/shared-util-i18n';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { WishlistPage } from './wishlist-page';

async function render(
	items: ConstructorParameters<typeof InMemoryWishlistStorage>[0] = [],
) {
	TestBed.configureTestingModule({
		providers: [
			provideRouter([]),
			// Real English file: the test also proves the keys exist.
			provideRootTranslations(
				(lang) => import(`../../i18n/${lang}.json`),
			),
			{
				provide: WishlistStorage,
				useValue: new InMemoryWishlistStorage(items),
			},
		],
	});
	// The JSON import is not tracked by whenStable(); wait for it explicitly.
	await firstValueFrom(TestBed.inject(TranslateService).use('en'));
	const fixture = TestBed.createComponent(WishlistPage);
	await fixture.whenStable();
	return { fixture, el: fixture.nativeElement as HTMLElement };
}

const item = {
	id: 'p-1',
	name: 'Headphones',
	price: 199,
	currency: 'EUR',
	imageUrl: '/a.svg',
	addedAt: '2026-01-01T00:00:00.000Z',
};

describe('WishlistPage', () => {
	it('shows an empty state that links back to the market', async () => {
		const { el } = await render();

		expect(el.querySelector('ui-state-message')?.textContent).toContain(
			'Your wish list is empty.',
		);
		expect(el.querySelector('a')?.getAttribute('href')).toBe('/market');
	});

	it('lists items with a pluralized count and a total', async () => {
		const { el } = await render([item]);

		expect(el.textContent).toContain('1 saved product');
		expect(el.querySelector('.total')?.textContent).toContain('€199.00');
	});

	it('announces a removal through the live region', async () => {
		const { fixture, el } = await render([item]);

		el.querySelector<HTMLButtonElement>('ui-product-card button')?.click();
		await fixture.whenStable();

		expect(TestBed.inject(WishlistStore).isEmpty()).toBe(true);
		expect(el.querySelector('p[role="status"]')?.textContent).toContain(
			'Headphones removed from your wish list.',
		);
	});
});
