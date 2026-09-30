import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
	it('links the product name and treats the image as decorative', () => {
		TestBed.configureTestingModule({ providers: [provideRouter([])] });
		const fixture = TestBed.createComponent(ProductCard);
		fixture.componentRef.setInput('name', 'Headphones');
		fixture.componentRef.setInput('price', '199,00 €');
		fixture.componentRef.setInput('imageUrl', '/img.svg');
		fixture.componentRef.setInput('link', ['/market', 'p-1']);
		fixture.detectChanges();
		const el: HTMLElement = fixture.nativeElement;

		const link = el.querySelector('h2 a');
		expect(link?.textContent).toBe('Headphones');
		expect(link?.getAttribute('href')).toBe('/market/p-1');
		// The name is already announced by the link; alt text would repeat it.
		expect(el.querySelector('img')?.getAttribute('alt')).toBe('');
	});
});
