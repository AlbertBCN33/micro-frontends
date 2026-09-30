import type { NativeFederationResult } from '@angular-architects/native-federation';
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { RemoteLoader } from './app/federation/remote-loader';
import type { RemoteManifest } from './app/federation/remote-manifest';

export function bootstrap(
	federation: NativeFederationResult,
	manifest: RemoteManifest,
) {
	return bootstrapApplication(App, {
		providers: [
			...appConfig.providers,
			{
				provide: RemoteLoader,
				useValue: new RemoteLoader(federation, manifest),
			},
		],
	});
}
