import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { WishlistStore } from '@mfe/shared-data-access-wishlist';
import { PageTitle, StateMessage } from '@mfe/shared-ui';
import {
	DEFAULT_LANGUAGE,
	isSupportedLanguage,
	LocalizedCurrencyPipe,
} from '@mfe/shared-util-i18n';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { ProductCatalog } from '../data/product-catalog';

@Component({
	selector: 'market-product-detail-page',
	imports: [
		RouterLink,
		PageTitle,
		StateMessage,
		TranslatePipe,
		LocalizedCurrencyPipe,
	],
	templateUrl: './product-detail-page.html',
	styleUrl: './product-detail-page.sass',
})
export class ProductDetailPage {
	protected readonly catalog = inject(ProductCatalog);
	protected readonly wishlist = inject(WishlistStore);
	readonly #translate = inject(TranslateService);

	// Read from ActivatedRoute rather than an input bound by
	// withComponentInputBinding(): that would silently depend on how the *host*
	// configured its router.
	readonly #id = toSignal(
		inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('id'))),
		{ requireSync: true },
	);

	protected readonly product = computed(() => {
		const id = this.#id();
		return id ? this.catalog.byId().get(id) : undefined;
	});

	protected readonly description = computed(() => {
		const lang = this.#translate.currentLang();
		return (
			this.product()?.description[
				isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE
			] ?? ''
		);
	});

	protected toggleWishlist(): void {
		const product = this.product();
		if (!product) return;
		this.wishlist.toggle({
			id: product.id,
			name: product.name,
			price: product.price,
			currency: product.currency,
			imageUrl: product.imageUrl,
		});
	}
}
