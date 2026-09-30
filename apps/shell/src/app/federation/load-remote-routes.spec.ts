import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Routes } from '@angular/router';
import { RemoteUnavailablePage } from '../pages/remote-unavailable/remote-unavailable-page';
import { loadRemoteRoutes } from './load-remote-routes';
import { RemoteLoader } from './remote-loader';

function load(result: Promise<unknown>) {
	TestBed.configureTestingModule({
		providers: [
			{ provide: RemoteLoader, useValue: { load: () => result } },
		],
	});
	vi.spyOn(console, 'error').mockImplementation(() => undefined);
	return runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
		loadRemoteRoutes('market')(),
	) as Promise<Routes>;
}

describe('loadRemoteRoutes', () => {
	it("returns the remote's routes", async () => {
		const routes: Routes = [{ path: 'x', children: [] }];
		await expect(load(Promise.resolve({ routes }))).resolves.toBe(routes);
	});

	it.each([
		[
			'the remote cannot be fetched',
			() => Promise.reject(new Error('offline')),
		],
		[
			'the remote breaks the contract',
			() => Promise.resolve({ default: [] }),
		],
	])('falls back to a contained error page when %s', async (_, result) => {
		const routes = await load(result());

		expect(routes).toEqual([
			{
				path: '**',
				component: RemoteUnavailablePage,
				data: { remote: 'market' },
			},
		]);
	});
});
