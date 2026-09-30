import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
	InMemoryWishlistStorage,
	WishlistStorage,
	WishlistStore,
} from '@mfe/shared-data-access-wishlist';
import {
	provideShellTranslations,
	useLanguage,
} from '../../testing/translations';
import { Header } from './header';

async function render(url = '/') {
	localStorage.clear();
	TestBed.configureTestingModule({
		providers: [
			provideShellTranslations(),
			{
				provide: WishlistStorage,
				useValue: new InMemoryWishlistStorage(),
			},
			provideRouter([{ path: '**', component: Header }]),
		],
	});
	await useLanguage('en');
	const harness = await RouterTestingHarness.create(url);
	const el = harness.routeNativeElement as HTMLElement;
	const link = (name: string) =>
		[...el.querySelectorAll('nav a')].find((a) =>
			a.textContent?.includes(name),
		);
	return { harness, el, link };
}

describe('Header', () => {
	it('marks only the current section with aria-current', async () => {
		const { link } = await render('/market/aurora');

		expect(link('Market')?.getAttribute('aria-current')).toBe('page');
		// "Dashboard" is an exact match, so it is not active on /market.
		expect(link('Dashboard')?.hasAttribute('aria-current')).toBe(false);
	});

	it('shows the live wishlist count, with a text alternative', async () => {
		const { harness, link } = await render();
		const wishlist = link('Wish list')!;
		expect(wishlist.querySelector('.badge')).toBeNull();
		expect(wishlist.textContent).toContain(', empty');

		TestBed.inject(WishlistStore).add({
			id: 'p-1',
			name: 'Mouse',
			price: 10,
			currency: 'EUR',
			imageUrl: '',
		});
		harness.detectChanges();

		const badge = wishlist.querySelector('.badge');
		expect(badge?.textContent?.trim()).toBe('1');
		// The digit is hidden from assistive tech; the sentence is announced.
		expect(badge?.getAttribute('aria-hidden')).toBe('true');
		expect(
			wishlist.querySelector('.visually-hidden')?.textContent,
		).toContain(', 1 item');
	});

	it('switches the language of the whole page', async () => {
		const { harness, el, link } = await render();
		const select = el.querySelector<HTMLSelectElement>('#language-select')!;
		expect(el.querySelector('label[for="language-select"]')).not.toBeNull();

		select.value = 'es';
		select.dispatchEvent(new Event('change'));
		await vi.waitFor(() => {
			harness.detectChanges();
			expect(link('Mercado')).toBeDefined();
		});

		expect(document.documentElement.lang).toBe('es');
		expect(localStorage.getItem('mfe.language')).toBe('es');
	});
});
