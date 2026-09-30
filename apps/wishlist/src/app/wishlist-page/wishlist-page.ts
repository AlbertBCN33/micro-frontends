import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistItem, WishlistStore } from '@mfe/shared-data-access-wishlist';
import { PageTitle, ProductCard, StateMessage } from '@mfe/shared-ui';
import { LocalizedCurrencyPipe } from '@mfe/shared-util-i18n';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

/**
 * Where the market is mounted. Route paths are the one piece of the public
 * contract between apps that is not typed; if the shell remounts the market,
 * this constant (and the e2e suite) must change with it.
 */
const MARKET_PATH = '/market';

@Component({
	selector: 'wishlist-page',
	imports: [
		RouterLink,
		PageTitle,
		ProductCard,
		StateMessage,
		TranslatePipe,
		LocalizedCurrencyPipe,
	],
	templateUrl: './wishlist-page.html',
	styleUrl: './wishlist-page.sass',
})
export class WishlistPage {
	protected readonly store = inject(WishlistStore);
	readonly #translate = inject(TranslateService);

	protected readonly marketPath = MARKET_PATH;
	/** Text for the polite live region, so removals are announced. */
	protected readonly announcement = signal('');

	protected remove(item: WishlistItem): void {
		this.store.remove(item.id);
		this.announcement.set(
			this.#translate.instant('WISHLIST.REMOVED', { name: item.name }),
		);
	}

	protected clear(): void {
		this.store.clear();
		this.announcement.set(this.#translate.instant('WISHLIST.CLEARED'));
	}
}
