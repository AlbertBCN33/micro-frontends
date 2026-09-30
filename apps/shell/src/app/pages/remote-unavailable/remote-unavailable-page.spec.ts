import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import {
	provideShellTranslations,
	useLanguage,
} from '../../testing/translations';
import { RemoteUnavailablePage } from './remote-unavailable-page';

describe('RemoteUnavailablePage', () => {
	it('names the failed remote in an assertive alert, with a way out', async () => {
		TestBed.configureTestingModule({
			providers: [
				provideShellTranslations(),
				provideRouter([
					{
						path: '**',
						component: RemoteUnavailablePage,
						data: { remote: 'wishlist' },
					},
				]),
			],
		});
		await useLanguage('en');
		const harness = await RouterTestingHarness.create('/wishlist');
		const el = harness.routeNativeElement as HTMLElement;

		expect(el.querySelector('h1')?.textContent).toBe(
			'This section is unavailable',
		);
		expect(el.querySelector('[role="alert"]')?.textContent).toContain(
			'The "wishlist" app could not be loaded.',
		);
		expect(
			el.querySelector('[role="alert"] button')?.textContent?.trim(),
		).toBe('Try again');
		expect(el.querySelector('a[href="/"]')).not.toBeNull();
	});
});
