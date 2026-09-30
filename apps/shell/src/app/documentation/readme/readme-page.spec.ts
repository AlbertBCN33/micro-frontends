import { TestBed } from '@angular/core/testing';
import {
	provideShellTranslations,
	useLanguage,
} from '../../testing/translations';
import { ReadmePage } from './readme-page';

async function render(lang: 'en' | 'es') {
	TestBed.configureTestingModule({ providers: [provideShellTranslations()] });
	await useLanguage(lang);
	const fixture = TestBed.createComponent(ReadmePage);
	await fixture.whenStable();
	return fixture.nativeElement as HTMLElement;
}

describe('ReadmePage', () => {
	it('renders the README as English content', async () => {
		const el = await render('en');
		const article = el.querySelector('article.readme');

		expect(article?.getAttribute('lang')).toBe('en');
		expect(article?.querySelector('h2')?.textContent).toContain(
			'MFE Store',
		);
		expect(el.querySelector('.readme-note')).toBeNull();
	});

	it('tells Spanish users the document is only in English', async () => {
		const el = await render('es');

		expect(el.querySelector('.readme-note')?.textContent).toContain(
			'solo está disponible en inglés',
		);
	});
});
