import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { JsonImportTranslateLoader } from './json-import-loader';
import {
	LanguagePreference,
	resolveInitialLanguage,
} from './language-preference';
import { provideRootTranslations } from './provide-translations';

const storageWith = (value: string | null) => ({ getItem: () => value });

describe('resolveInitialLanguage', () => {
	it('prefers a saved, supported language', () => {
		expect(resolveInitialLanguage(storageWith('es'), ['en-US'])).toBe('es');
	});

	it('ignores an unsupported saved value and uses the browser locale', () => {
		expect(resolveInitialLanguage(storageWith('fr'), ['es-ES', 'en'])).toBe(
			'es',
		);
	});

	it('falls back to English when nothing matches', () => {
		expect(resolveInitialLanguage(storageWith(null), ['de-DE'])).toBe('en');
	});

	it('survives storage that throws (e.g. blocked cookies)', () => {
		const throwing = {
			getItem: () => {
				throw new Error('SecurityError');
			},
		};
		expect(resolveInitialLanguage(throwing, ['es'])).toBe('es');
	});
});

describe('JsonImportTranslateLoader', () => {
	it('unwraps the default export of the imported JSON module', async () => {
		const loader = new JsonImportTranslateLoader(async (lang) => ({
			default: { GREETING: `hello-${lang}` },
		}));

		await expect(
			firstValueFrom(loader.getTranslation('es')),
		).resolves.toEqual({ GREETING: 'hello-es' });
	});
});

describe('LanguagePreference', () => {
	beforeEach(() => {
		localStorage.clear();
		TestBed.configureTestingModule({
			providers: provideRootTranslations(
				async () => ({ default: {} }),
				'en',
			),
		});
	});

	it('updates <html lang> and remembers the choice', async () => {
		const preference = TestBed.inject(LanguagePreference);

		preference.use('es');
		await vi.waitFor(() => expect(preference.current()).toBe('es'));
		TestBed.tick();

		expect(document.documentElement.lang).toBe('es');
		expect(localStorage.getItem('mfe.language')).toBe('es');
	});
});
