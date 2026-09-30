import { Injectable } from '@angular/core';
import { isWishlistItem, WishlistItem } from './wishlist-item';

/**
 * Persistence port. The store depends on this abstraction, so moving from
 * localStorage to Firestore (or a real API) is a provider swap:
 *
 * ```ts
 * { provide: WishlistStorage, useClass: FirestoreWishlistStorage }
 * ```
 */
@Injectable({
	providedIn: 'root',
	useFactory: () => new LocalStorageWishlistStorage(),
})
export abstract class WishlistStorage {
	abstract load(): readonly WishlistItem[];
	abstract save(items: readonly WishlistItem[]): void;
	/**
	 * Notifies when the data changed outside this page (another tab). Returns
	 * an unsubscribe function.
	 */
	abstract watch(onExternalChange: () => void): () => void;
}

/** Versioned so that a future shape change can migrate instead of crash. */
export const WISHLIST_STORAGE_KEY = 'mfe.wishlist.v1';

export class LocalStorageWishlistStorage extends WishlistStorage {
	load(): readonly WishlistItem[] {
		try {
			const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
			const parsed: unknown = raw ? JSON.parse(raw) : [];
			// Stored data is untrusted input: drop anything that does not match
			// the contract instead of letting it break rendering.
			return Array.isArray(parsed) ? parsed.filter(isWishlistItem) : [];
		} catch {
			return [];
		}
	}

	save(items: readonly WishlistItem[]): void {
		try {
			localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
		} catch {
			// Quota exceeded or storage blocked: keep working in memory.
		}
	}

	watch(onExternalChange: () => void): () => void {
		const listener = (event: StorageEvent) => {
			if (event.key === WISHLIST_STORAGE_KEY) onExternalChange();
		};
		window.addEventListener('storage', listener);
		return () => window.removeEventListener('storage', listener);
	}
}

/** Test and prototyping adapter. */
export class InMemoryWishlistStorage extends WishlistStorage {
	constructor(private items: readonly WishlistItem[] = []) {
		super();
	}

	load(): readonly WishlistItem[] {
		return this.items;
	}

	save(items: readonly WishlistItem[]): void {
		this.items = items;
	}

	watch(): () => void {
		return () => undefined;
	}
}
