/**
 * The cross-app contract: a snapshot of a product at the moment it was saved.
 *
 * It holds everything the wishlist needs to render. The wishlist remote never
 * calls the market's API, so the two teams can change their catalog and
 * wishlist independently. Adding fields is non-breaking; removing or renaming
 * one is a major version of this library.
 */
export interface WishlistItem {
	readonly id: string;
	readonly name: string;
	readonly price: number;
	readonly currency: string;
	readonly imageUrl: string;
	/** ISO-8601 timestamp. */
	readonly addedAt: string;
}

export type NewWishlistItem = Omit<WishlistItem, 'addedAt'>;

export function isWishlistItem(value: unknown): value is WishlistItem {
	if (typeof value !== 'object' || value === null) return false;
	const item = value as Record<string, unknown>;
	return (
		typeof item['id'] === 'string' &&
		typeof item['name'] === 'string' &&
		typeof item['price'] === 'number' &&
		typeof item['currency'] === 'string' &&
		typeof item['imageUrl'] === 'string' &&
		typeof item['addedAt'] === 'string'
	);
}
