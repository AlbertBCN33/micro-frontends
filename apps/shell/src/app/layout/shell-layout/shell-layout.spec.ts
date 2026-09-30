import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
	InMemoryWishlistStorage,
	WishlistStorage,
} from '@mfe/shared-data-access-wishlist';
import {
	provideShellTranslations,
	useLanguage,
} from '../../testing/translations';
import { ShellLayout } from './shell-layout';

@Component({ template: '<input aria-label="Search" />' })
class SearchPage {}

@Component({ template: '<p>Other page</p>' })
class OtherPage {}

async function render() {
	TestBed.configureTestingModule({
		providers: [
			provideShellTranslations(),
			{
				provide: WishlistStorage,
				useValue: new InMemoryWishlistStorage(),
			},
			provideRouter([
				{ path: '', component: SearchPage },
				{ path: 'other', component: OtherPage },
			]),
		],
	});
	await useLanguage('en');
	const fixture = TestBed.createComponent(ShellLayout);
	const router = TestBed.inject(Router);
	await router.navigateByUrl('/');
	await fixture.whenStable();
	const el: HTMLElement = fixture.nativeElement;
	return { fixture, el, router, main: el.querySelector('main')! };
}

describe('ShellLayout', () => {
	it('skip link focuses <main> without navigating', async () => {
		const { el, router, main } = await render();
		const skip = el.querySelector<HTMLAnchorElement>('.skip-link')!;
		expect(skip.textContent?.trim()).toBe('Skip to main content');

		skip.click();

		expect(document.activeElement).toBe(main);
		expect(router.url).toBe('/');
	});

	it('moves focus to <main> when the path changes', async () => {
		const { fixture, router, main } = await render();

		await router.navigateByUrl('/other');
		await fixture.whenStable();

		expect(document.activeElement).toBe(main);
	});

	it('keeps focus where it is when only query params change', async () => {
		const { fixture, el, router } = await render();
		const input = el.querySelector<HTMLInputElement>('input')!;
		input.focus();

		// What the market does while the user types in its search box.
		await router.navigate([], { queryParams: { q: 'mouse' } });
		await fixture.whenStable();

		expect(document.activeElement).toBe(input);
	});
});
