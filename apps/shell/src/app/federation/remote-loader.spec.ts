import { RemoteLoader, UnknownRemoteError } from './remote-loader';
import { fetchRemoteManifest } from './remote-manifest';

function fakeFederation() {
	return {
		initRemoteEntry: vi.fn().mockResolvedValue({}),
		loadRemoteModule: vi.fn().mockResolvedValue({ routes: [] }),
	};
}

const manifest = {
	market: 'http://market.test/remoteEntry.json',
	wishlist: 'http://wishlist.test/remoteEntry.json',
};

describe('RemoteLoader', () => {
	it('registers nothing until a remote is requested', () => {
		const federation = fakeFederation();
		const loader = new RemoteLoader(federation as never, manifest);

		expect(federation.initRemoteEntry).not.toHaveBeenCalled();
		expect(loader.loaded().size).toBe(0);
		expect(loader.remotes).toEqual(['market', 'wishlist']);
	});

	it('registers a remote once, even under concurrent navigations', async () => {
		const federation = fakeFederation();
		const loader = new RemoteLoader(federation as never, manifest);

		await Promise.all([
			loader.load('market', './routes'),
			loader.load('market', './routes'),
		]);

		expect(federation.initRemoteEntry).toHaveBeenCalledTimes(1);
		expect(federation.initRemoteEntry).toHaveBeenCalledWith(
			manifest.market,
			'market',
		);
		expect(federation.loadRemoteModule).toHaveBeenCalledWith(
			'market',
			'./routes',
		);
		expect([...loader.loaded()]).toEqual(['market']);
	});

	it('forgets a failed registration so the next navigation retries', async () => {
		const federation = fakeFederation();
		federation.initRemoteEntry
			.mockRejectedValueOnce(new Error('offline'))
			.mockResolvedValueOnce({});
		const loader = new RemoteLoader(federation as never, manifest);

		await expect(loader.load('market', './routes')).rejects.toThrow(
			'offline',
		);
		await expect(loader.load('market', './routes')).resolves.toBeDefined();
		expect(federation.initRemoteEntry).toHaveBeenCalledTimes(2);
	});

	it('rejects remotes missing from the manifest', async () => {
		const loader = new RemoteLoader(fakeFederation() as never, manifest);
		await expect(
			loader.load('checkout', './routes'),
		).rejects.toBeInstanceOf(UnknownRemoteError);
	});
});

describe('fetchRemoteManifest', () => {
	afterEach(() => vi.unstubAllGlobals());

	const respond = (body: unknown, ok = true) =>
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok,
				status: ok ? 200 : 404,
				json: async () => body,
			}),
		);

	it('returns a valid manifest', async () => {
		respond(manifest);
		await expect(fetchRemoteManifest('m.json')).resolves.toEqual(manifest);
	});

	it.each([
		['an HTTP error', () => respond({}, false)],
		['a non-string URL', () => respond({ market: 42 })],
	])('fails fast on %s', async (_, arrange) => {
		arrange();
		await expect(fetchRemoteManifest('m.json')).rejects.toThrow();
	});
});
