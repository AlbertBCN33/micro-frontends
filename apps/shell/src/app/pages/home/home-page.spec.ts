import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import {
	InMemoryWishlistStorage,
	WishlistStorage,
} from '@mfe/shared-data-access-wishlist';
import { RemoteLoader } from '../../federation/remote-loader';
import {
	provideShellTranslations,
	useLanguage,
} from '../../testing/translations';
import { HomePage } from './home-page';

const saved = (id: string, price: number) => ({
	id,
	name: id,
	price,
	currency: 'EUR',
	imageUrl: '',
	addedAt: '2026-01-01T00:00:00.000Z',
});

async function render(
	items: ReturnType<typeof saved>[],
	loaded: string[] = [],
) {
	TestBed.configureTestingModule({
		providers: [
			provideShellTranslations(),
			provideRouter([]),
			{
				provide: WishlistStorage,
				useValue: new InMemoryWishlistStorage(items),
			},
			{
				provide: RemoteLoader,
				useValue: {
					remotes: ['market', 'wishlist'],
					loaded: signal(new Set(loaded)),
				},
			},
		],
	});
	await useLanguage('en');
	const fixture = TestBed.createComponent(HomePage);
	await fixture.whenStable();
	return fixture.nativeElement as HTMLElement;
}

describe('HomePage', () => {
	it('summarizes the shared wishlist', async () => {
		const el = await render([saved('a', 100), saved('b', 49.5)]);

		expect(
			el.querySelector('[data-testid="home-wishlist-count"]')
				?.textContent,
		).toContain('2 saved products');
		expect(el.textContent).toContain('€149.50');
	});

	it('handles the empty wishlist', async () => {
		const el = await render([]);

		expect(
			el.querySelector('[data-testid="home-wishlist-count"]')
				?.textContent,
		).toContain('No saved products');
	});

	it('shows which remotes have been downloaded', async () => {
		const el = await render([], ['market']);
		const status = (remote: string) =>
			el
				.querySelector(`[data-testid="remote-status-${remote}"]`)
				?.textContent?.replace(/\s+/g, ' ')
				.trim();

		expect(status('market')).toBe('market loaded');
		expect(status('wishlist')).toBe('wishlist not loaded yet');
	});
});
