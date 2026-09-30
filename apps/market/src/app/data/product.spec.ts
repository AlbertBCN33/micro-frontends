import { parseProducts } from './product';

const dto = {
	id: 'p-1',
	name: 'Headphones',
	category: 'audio',
	price: 199,
	currency: 'EUR',
	rating: 4.5,
	image: 'images/audio.svg',
	description: { en: 'Nice', es: 'Bonitos' },
};

describe('parseProducts', () => {
	it('maps the DTO and resolves images against the given base URL', () => {
		const [product] = parseProducts([dto], 'http://cdn.test/market/');

		expect(product.imageUrl).toBe(
			'http://cdn.test/market/images/audio.svg',
		);
		expect(product.description.es).toBe('Bonitos');
	});

	it.each([
		['a non-array payload', { products: [dto] }],
		['an unknown category', [{ ...dto, category: 'toasters' }]],
		['a string price', [{ ...dto, price: '199' }]],
		[
			'an unsupported description language',
			[{ ...dto, description: { fr: 'x' } }],
		],
	])('rejects %s', (_, payload) => {
		expect(() => parseProducts(payload, 'http://cdn.test/')).toThrow();
	});
});
