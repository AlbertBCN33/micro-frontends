import {
	computed,
	DestroyRef,
	inject,
	Injectable,
	signal,
} from '@angular/core';
import { NewWishlistItem, WishlistItem } from './wishlist-item';
import { WishlistStorage } from './wishlist-storage';

/**
 * Wishlist state shared by the shell (badge), market (toggle) and wishlist
 * (list) apps.
 *
 * It is `providedIn: 'root'`, and Native Federation shares this library as a
 * singleton, so every app resolves the same instance from the shell's root
 * injector. The state is plain signals; components read it and never write
 * signals directly, only through the intent methods below.
 */
@Injectable({ providedIn: 'root' })
export class WishlistStore {
	readonly #storage = inject(WishlistStorage);
	readonly #items = signal<readonly WishlistItem[]>(this.#storage.load());

	readonly items = this.#items.asReadonly();
	readonly count = computed(() => this.#items().length);
	readonly isEmpty = computed(() => this.count() === 0);
	readonly #ids = computed(
		() => new Set(this.#items().map((item) => item.id)),
	);

	constructor() {
		const stopWatching = this.#storage.watch(() =>
			this.#items.set(this.#storage.load()),
		);
		inject(DestroyRef).onDestroy(stopWatching);
	}

	has(id: string): boolean {
		return this.#ids().has(id);
	}

	/**
	 * Totals grouped by currency. Summing different currencies would be wrong,
	 * even if the catalog only uses one today.
	 */
	readonly totals = computed(() => {
		const totals = new Map<string, number>();
		for (const { currency, price } of this.#items()) {
			totals.set(currency, (totals.get(currency) ?? 0) + price);
		}
		return [...totals].map(([currency, amount]) => ({ currency, amount }));
	});

	add(item: NewWishlistItem): void {
		if (this.has(item.id)) return;
		this.#commit([
			...this.#items(),
			{ ...item, addedAt: new Date().toISOString() },
		]);
	}

	remove(id: string): void {
		if (!this.has(id)) return;
		this.#commit(this.#items().filter((item) => item.id !== id));
	}

	toggle(item: NewWishlistItem): void {
		if (this.has(item.id)) {
			this.remove(item.id);
		} else {
			this.add(item);
		}
	}

	clear(): void {
		this.#commit([]);
	}

	#commit(items: readonly WishlistItem[]): void {
		this.#items.set(items);
		this.#storage.save(items);
	}
}
