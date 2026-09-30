import { httpResource } from '@angular/common/http';
import { computed, Injectable, InjectionToken, inject } from '@angular/core';
import { parseProducts, Product } from './product';

/**
 * Where the market's own files live at runtime.
 *
 * When the shell renders the market, the page origin is the *shell's*, so a
 * relative `api/products.json` would hit the wrong server. `import.meta.url`
 * is the URL of the market's own JS chunk, which is always served from the
 * market's deployment.
 */
export const MARKET_BASE_URL = new InjectionToken<string>('MARKET_BASE_URL', {
	providedIn: 'root',
	factory: () => new URL('./', import.meta.url).href,
});

/**
 * Catalog endpoint. It is a static file today. Pointing this token at a real
 * API is the whole migration, because the parser already guards the contract.
 */
export const PRODUCTS_URL = new InjectionToken<string>('PRODUCTS_URL', {
	providedIn: 'root',
	factory: () => new URL('api/products.json', inject(MARKET_BASE_URL)).href,
});

/**
 * Provided on the market's route subtree, so list and detail pages share one
 * request, and the data is released when the user leaves the market.
 */
@Injectable()
export class ProductCatalog {
	readonly #url = inject(PRODUCTS_URL);
	readonly #assetsBaseUrl = inject(MARKET_BASE_URL);

	readonly #resource = httpResource<Product[]>(() => this.#url, {
		// Image paths in the payload are relative to the market root, not to the
		// API endpoint.
		parse: (raw) => parseProducts(raw, this.#assetsBaseUrl),
		defaultValue: [],
	});

	readonly products = this.#resource.value;
	readonly isLoading = this.#resource.isLoading;
	readonly error = this.#resource.error;

	readonly byId = computed(
		() => new Map(this.products().map((product) => [product.id, product])),
	);

	reload(): void {
		this.#resource.reload();
	}
}
