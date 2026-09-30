import { computed, signal } from '@angular/core';
import { Product } from '../data/product';
import { ProductCatalog } from '../data/product-catalog';

export const PRODUCTS: Product[] = [
	{
		id: 'aurora',
		name: 'Aurora Headphones',
		category: 'audio',
		price: 249,
		currency: 'EUR',
		rating: 4.7,
		imageUrl: 'http://market.test/images/audio.svg',
		description: { en: 'Noise cancelling.', es: 'Cancelación de ruido.' },
	},
	{
		id: 'precision-mouse',
		name: 'Precision Mouse',
		category: 'mice',
		price: 79,
		currency: 'EUR',
		rating: 4.6,
		imageUrl: 'http://market.test/images/mice.svg',
		description: { en: 'Vertical grip.', es: 'Agarre vertical.' },
	},
	{
		id: 'gaming-mouse',
		name: 'Gaming Mouse',
		category: 'mice',
		price: 69,
		currency: 'EUR',
		rating: 4.4,
		imageUrl: 'http://market.test/images/mice.svg',
		description: { en: 'Light.', es: 'Ligero.' },
	},
];

/**
 * Stand-in for ProductCatalog with the same public surface, so page tests
 * control loading, error and data states without HTTP.
 */
export function createFakeCatalog(products: Product[] = PRODUCTS) {
	const state = {
		products: signal(products),
		isLoading: signal(false),
		error: signal<unknown>(undefined),
	};
	const fake = {
		...state,
		byId: computed(() => new Map(state.products().map((p) => [p.id, p]))),
		reload: vi.fn(),
	};
	return fake as typeof fake & Pick<ProductCatalog, 'reload'>;
}
