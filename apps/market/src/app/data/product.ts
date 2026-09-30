import { isSupportedLanguage, Language } from '@mfe/shared-util-i18n';

export const PRODUCT_CATEGORIES = [
	'audio',
	'keyboards',
	'displays',
	'mice',
	'laptops',
	'cameras',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
	readonly id: string;
	readonly name: string;
	readonly category: ProductCategory;
	readonly price: number;
	readonly currency: string;
	readonly rating: number;
	/** Absolute URL, resolved against the market's own origin. */
	readonly imageUrl: string;
	readonly description: Readonly<Record<Language, string>>;
}

/** Wire format as served by `api/products.json`. */
interface ProductDto {
	id: string;
	name: string;
	category: string;
	price: number;
	currency: string;
	rating: number;
	image: string;
	description: Record<string, string>;
}

function isProductDto(value: unknown): value is ProductDto {
	if (typeof value !== 'object' || value === null) return false;
	const dto = value as Record<string, unknown>;
	const description = dto['description'];
	return (
		typeof dto['id'] === 'string' &&
		typeof dto['name'] === 'string' &&
		(PRODUCT_CATEGORIES as readonly unknown[]).includes(dto['category']) &&
		typeof dto['price'] === 'number' &&
		typeof dto['currency'] === 'string' &&
		typeof dto['rating'] === 'number' &&
		typeof dto['image'] === 'string' &&
		typeof description === 'object' &&
		description !== null &&
		Object.keys(description).every(isSupportedLanguage)
	);
}

/**
 * Validates the response at the trust boundary and maps it to the domain
 * model. An invalid payload fails loudly, so the UI shows its error state
 * instead of rendering `undefined`.
 */
export function parseProducts(raw: unknown, baseUrl: string): Product[] {
	if (!Array.isArray(raw) || !raw.every(isProductDto)) {
		throw new Error('Unexpected products payload');
	}
	return raw.map((dto) => ({
		id: dto.id,
		name: dto.name,
		category: dto.category as ProductCategory,
		price: dto.price,
		currency: dto.currency,
		rating: dto.rating,
		imageUrl: new URL(dto.image, baseUrl).href,
		description: dto.description as Record<Language, string>,
	}));
}
