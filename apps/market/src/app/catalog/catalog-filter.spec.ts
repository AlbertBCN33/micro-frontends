import { convertToParamMap } from '@angular/router';
import { Product } from '../data/product';
import { applyFilter, filterFromParams } from './catalog-filter';

const product = (id: string, overrides: Partial<Product>): Product => ({
	id,
	name: id,
	category: 'audio',
	price: 10,
	currency: 'EUR',
	rating: 4,
	imageUrl: '',
	description: { en: '', es: '' },
	...overrides,
});

const products = [
	product('Keyboard', { category: 'keyboards', price: 100, rating: 4.1 }),
	product('Mouse', { category: 'mice', price: 50, rating: 4.9 }),
	product('Gaming Mouse', { category: 'mice', price: 70, rating: 4.2 }),
];

describe('filterFromParams', () => {
	it('reads valid query params', () => {
		expect(
			filterFromParams(
				convertToParamMap({
					q: ' mouse ',
					category: 'mice',
					sort: 'rating',
				}),
			),
		).toEqual({ query: 'mouse', category: 'mice', sort: 'rating' });
	});

	it('falls back to defaults for hand-edited URLs', () => {
		expect(
			filterFromParams(
				convertToParamMap({ category: 'x', sort: 'cheapest' }),
			),
		).toEqual({ query: '', category: null, sort: 'featured' });
	});
});

describe('applyFilter', () => {
	const names = (filter: Parameters<typeof applyFilter>[1]) =>
		applyFilter(products, filter).map((p) => p.name);

	it('keeps curated order by default', () => {
		expect(names({ query: '', category: null, sort: 'featured' })).toEqual([
			'Keyboard',
			'Mouse',
			'Gaming Mouse',
		]);
	});

	it('searches case-insensitively and filters by category', () => {
		expect(
			names({ query: 'MOUSE', category: 'mice', sort: 'featured' }),
		).toEqual(['Mouse', 'Gaming Mouse']);
		expect(
			names({ query: 'mouse', category: 'keyboards', sort: 'featured' }),
		).toEqual([]);
	});

	it.each([
		['price-asc', ['Mouse', 'Gaming Mouse', 'Keyboard']],
		['price-desc', ['Keyboard', 'Gaming Mouse', 'Mouse']],
		['rating', ['Mouse', 'Gaming Mouse', 'Keyboard']],
	] as const)('sorts by %s', (sort, expected) => {
		expect(names({ query: '', category: null, sort })).toEqual(expected);
	});

	it('does not mutate the input', () => {
		const copy = [...products];
		applyFilter(products, { query: '', category: null, sort: 'price-asc' });
		expect(products).toEqual(copy);
	});
});
