import { TestBed } from '@angular/core/testing';
import { NewWishlistItem, WishlistItem } from './wishlist-item';
import {
	InMemoryWishlistStorage,
	LocalStorageWishlistStorage,
	WISHLIST_STORAGE_KEY,
	WishlistStorage,
} from './wishlist-storage';
import { WishlistStore } from './wishlist-store';

const headphones: NewWishlistItem = {
	id: 'p-1',
	name: 'Headphones',
	price: 199,
	currency: 'EUR',
	imageUrl: '/headphones.svg',
};
const keyboard: NewWishlistItem = { ...headphones, id: 'p-2', price: 120.5 };

function setup(initial: WishlistItem[] = []) {
	const storage = new InMemoryWishlistStorage(initial);
	TestBed.configureTestingModule({
		providers: [{ provide: WishlistStorage, useValue: storage }],
	});
	return { store: TestBed.inject(WishlistStore), storage };
}

describe('WishlistStore', () => {
	it('starts from what the storage already holds', () => {
		const { store } = setup([{ ...headphones, addedAt: '2026-01-01' }]);

		expect(store.count()).toBe(1);
		expect(store.has('p-1')).toBe(true);
	});

	it('adds an item once, stamps it and persists it', () => {
		const { store, storage } = setup();

		store.add(headphones);
		store.add(headphones);

		expect(store.count()).toBe(1);
		expect(store.items()[0].addedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
		expect(storage.load()).toEqual(store.items());
	});

	it('toggles membership', () => {
		const { store } = setup();

		store.toggle(headphones);
		expect(store.has('p-1')).toBe(true);

		store.toggle(headphones);
		expect(store.isEmpty()).toBe(true);
	});

	it('groups totals by currency', () => {
		const { store } = setup();

		store.add(headphones);
		store.add(keyboard);
		store.add({ ...keyboard, id: 'p-3', currency: 'USD', price: 10 });

		expect(store.totals()).toEqual([
			{ currency: 'EUR', amount: 319.5 },
			{ currency: 'USD', amount: 10 },
		]);
	});

	it('removes and clears', () => {
		const { store } = setup();
		store.add(headphones);
		store.add(keyboard);

		store.remove('p-1');
		expect(store.items().map((i) => i.id)).toEqual(['p-2']);

		store.clear();
		expect(store.isEmpty()).toBe(true);
	});
});

describe('LocalStorageWishlistStorage', () => {
	beforeEach(() => localStorage.clear());

	it('round-trips items', () => {
		const storage = new LocalStorageWishlistStorage();
		const items = [{ ...headphones, addedAt: '2026-01-01T00:00:00.000Z' }];

		storage.save(items);

		expect(storage.load()).toEqual(items);
	});

	it('treats corrupted or foreign data as untrusted', () => {
		localStorage.setItem(
			WISHLIST_STORAGE_KEY,
			JSON.stringify([{ id: 1 }, { ...headphones, addedAt: 'x' }]),
		);
		expect(new LocalStorageWishlistStorage().load()).toHaveLength(1);

		localStorage.setItem(WISHLIST_STORAGE_KEY, '{not json');
		expect(new LocalStorageWishlistStorage().load()).toEqual([]);
	});

	it('reports changes made in another tab', () => {
		const storage = new LocalStorageWishlistStorage();
		const onChange = vi.fn();
		const stop = storage.watch(onChange);

		window.dispatchEvent(
			new StorageEvent('storage', { key: WISHLIST_STORAGE_KEY }),
		);
		window.dispatchEvent(new StorageEvent('storage', { key: 'other' }));
		stop();
		window.dispatchEvent(
			new StorageEvent('storage', { key: WISHLIST_STORAGE_KEY }),
		);

		expect(onChange).toHaveBeenCalledTimes(1);
	});
});
