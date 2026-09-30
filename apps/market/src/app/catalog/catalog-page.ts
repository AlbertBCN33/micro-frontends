import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { WishlistStore } from '@mfe/shared-data-access-wishlist';
import { PageTitle, ProductCard, StateMessage } from '@mfe/shared-ui';
import { LocalizedCurrencyPipe } from '@mfe/shared-util-i18n';
import { TranslatePipe } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Product, PRODUCT_CATEGORIES } from '../data/product';
import { ProductCatalog } from '../data/product-catalog';
import { applyFilter, filterFromParams, SORT_OPTIONS } from './catalog-filter';

@Component({
	selector: 'market-catalog-page',
	imports: [
		PageTitle,
		ProductCard,
		StateMessage,
		TranslatePipe,
		LocalizedCurrencyPipe,
	],
	templateUrl: './catalog-page.html',
	styleUrl: './catalog-page.sass',
})
export class CatalogPage {
	readonly #router = inject(Router);
	readonly #route = inject(ActivatedRoute);
	protected readonly catalog = inject(ProductCatalog);
	protected readonly wishlist = inject(WishlistStore);

	protected readonly categories = PRODUCT_CATEGORIES;
	protected readonly sortOptions = SORT_OPTIONS;

	readonly #params = toSignal(this.#route.queryParamMap, {
		requireSync: true,
	});
	protected readonly filter = computed(() =>
		filterFromParams(this.#params()),
	);
	protected readonly results = computed(() =>
		applyFilter(this.catalog.products(), this.filter()),
	);

	readonly #search = new Subject<string>();

	constructor() {
		// Debounced, so typing does not create a history entry per keystroke.
		this.#search
			.pipe(
				debounceTime(250),
				distinctUntilChanged(),
				takeUntilDestroyed(),
			)
			.subscribe((q) => this.#updateParams({ q: q.trim() || null }));
	}

	protected onSearch(event: Event): void {
		this.#search.next((event.target as HTMLInputElement).value);
	}

	protected onCategory(event: Event): void {
		const value = (event.target as HTMLSelectElement).value;
		this.#updateParams({ category: value || null });
	}

	protected onSort(event: Event): void {
		const value = (event.target as HTMLSelectElement).value;
		this.#updateParams({ sort: value === 'featured' ? null : value });
	}

	protected clearFilters(): void {
		this.#updateParams({ q: null, category: null, sort: null });
	}

	protected toggleWishlist(product: Product): void {
		this.wishlist.toggle({
			id: product.id,
			name: product.name,
			price: product.price,
			currency: product.currency,
			imageUrl: product.imageUrl,
		});
	}

	#updateParams(queryParams: Params): void {
		void this.#router.navigate([], {
			relativeTo: this.#route,
			queryParams,
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});
	}
}
