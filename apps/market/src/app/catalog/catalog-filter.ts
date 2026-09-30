import { ParamMap } from '@angular/router';
import { Product, PRODUCT_CATEGORIES, ProductCategory } from '../data/product';

export const SORT_OPTIONS = [
	'featured',
	'price-asc',
	'price-desc',
	'rating',
] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

/**
 * Catalog filter state. It lives in the URL (?q=&category=&sort=), so results
 * can be shared, bookmarked and restored with the back button.
 */
export interface CatalogFilter {
	readonly query: string;
	readonly category: ProductCategory | null;
	readonly sort: SortOption;
}

/** Tolerates hand-edited URLs: unknown values fall back to defaults. */
export function filterFromParams(params: ParamMap): CatalogFilter {
	const category = params.get('category');
	const sort = params.get('sort');
	return {
		query: (params.get('q') ?? '').trim(),
		category: (PRODUCT_CATEGORIES as readonly (string | null)[]).includes(
			category,
		)
			? (category as ProductCategory)
			: null,
		sort: (SORT_OPTIONS as readonly (string | null)[]).includes(sort)
			? (sort as SortOption)
			: 'featured',
	};
}

const comparators: Record<SortOption, (a: Product, b: Product) => number> = {
	// "featured" keeps the curated order from the API.
	featured: () => 0,
	'price-asc': (a, b) => a.price - b.price,
	'price-desc': (a, b) => b.price - a.price,
	rating: (a, b) => b.rating - a.rating,
};

export function applyFilter(
	products: readonly Product[],
	filter: CatalogFilter,
): Product[] {
	const needle = filter.query.toLocaleLowerCase();
	return products
		.filter(
			(product) =>
				(!filter.category || product.category === filter.category) &&
				(!needle || product.name.toLocaleLowerCase().includes(needle)),
		)
		.sort(comparators[filter.sort]);
}
