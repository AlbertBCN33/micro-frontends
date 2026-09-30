import { provideHttpClient } from '@angular/common/http';
import {
	HttpTestingController,
	provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
	MARKET_BASE_URL,
	PRODUCTS_URL,
	ProductCatalog,
} from './product-catalog';

function setup() {
	TestBed.configureTestingModule({
		providers: [
			provideHttpClient(),
			provideHttpClientTesting(),
			ProductCatalog,
			{ provide: MARKET_BASE_URL, useValue: 'http://market.test/' },
			{ provide: PRODUCTS_URL, useValue: 'http://api.test/products' },
		],
	});
	const catalog = TestBed.inject(ProductCatalog);
	TestBed.tick();
	return { catalog, http: TestBed.inject(HttpTestingController) };
}

describe('ProductCatalog', () => {
	it('loads products and resolves assets against the market, not the API', async () => {
		const { catalog, http } = setup();
		expect(catalog.isLoading()).toBe(true);

		http.expectOne('http://api.test/products').flush([
			{
				id: 'p-1',
				name: 'Headphones',
				category: 'audio',
				price: 199,
				currency: 'EUR',
				rating: 4.5,
				image: 'images/audio.svg',
				description: { en: 'Nice', es: 'Bonitos' },
			},
		]);
		await TestBed.inject(ApplicationRef).whenStable();

		expect(catalog.isLoading()).toBe(false);
		expect(catalog.byId().get('p-1')?.imageUrl).toBe(
			'http://market.test/images/audio.svg',
		);
	});

	it('exposes an error for invalid payloads and can retry', async () => {
		const { catalog, http } = setup();

		http.expectOne('http://api.test/products').flush({ unexpected: true });
		await TestBed.inject(ApplicationRef).whenStable();
		expect(catalog.error()).toBeTruthy();

		catalog.reload();
		TestBed.tick();
		http.expectOne('http://api.test/products').flush([]);
		await TestBed.inject(ApplicationRef).whenStable();
		expect(catalog.error()).toBeUndefined();
		expect(catalog.products()).toEqual([]);
	});
});
