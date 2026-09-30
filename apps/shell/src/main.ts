import { initFederation } from '@angular-architects/native-federation';
import { fetchRemoteManifest } from './app/federation/remote-manifest';

// initFederation only sets up the shared dependencies (the import map). The
// empty object means no remote is registered up front: each remote's metadata
// and code are fetched the first time its route is visited (see RemoteLoader).
// The manifest itself is a few bytes and is fetched in parallel.
Promise.all([
	initFederation({}, { hostRemoteEntry: { url: './remoteEntry.json' } }),
	fetchRemoteManifest('federation.manifest.json'),
])
	.then(([federation, manifest]) =>
		import('./bootstrap').then(({ bootstrap }) =>
			bootstrap(federation, manifest),
		),
	)
	.catch((error) => console.error(error));
