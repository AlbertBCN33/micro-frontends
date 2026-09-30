import { inject } from '@angular/core';
import { LoadChildrenCallback, Routes } from '@angular/router';
import { RemoteUnavailablePage } from '../pages/remote-unavailable/remote-unavailable-page';
import { RemoteLoader } from './remote-loader';

/** What every remote exposes as `./routes`. */
export interface RemoteRoutesModule {
	readonly routes: Routes;
}

/**
 * `loadChildren` for a remote. If the remote cannot be loaded (it is down, the
 * deploy is broken, or the contract changed), the user sees a contained error
 * page inside the normal layout instead of a blank screen or a failed
 * navigation.
 */
export function loadRemoteRoutes(remote: string): LoadChildrenCallback {
	return async () => {
		// Resolved synchronously: loadChildren runs in an injection context only
		// until the first await.
		const loader = inject(RemoteLoader);
		try {
			const module = await loader.load<RemoteRoutesModule>(
				remote,
				'./routes',
			);
			if (!Array.isArray(module?.routes)) {
				throw new Error(
					`Remote "${remote}" does not expose a routes array`,
				);
			}
			return module.routes;
		} catch (error) {
			console.error(
				`[federation] Failed to load remote "${remote}"`,
				error,
			);
			return [
				{
					path: '**',
					component: RemoteUnavailablePage,
					data: { remote },
				},
			];
		}
	};
}
