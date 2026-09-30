import type { NativeFederationResult } from '@angular-architects/native-federation';
import { signal } from '@angular/core';
import type { RemoteManifest } from './remote-manifest';

export class UnknownRemoteError extends Error {
	constructor(remote: string) {
		super(`Remote "${remote}" is not declared in federation.manifest.json`);
	}
}

/**
 * Lazily registers and loads remotes.
 *
 * The shell starts with *no* remotes registered. A remote's `remoteEntry.json`
 * and its code are only fetched the first time the user navigates to it, so a
 * slow or broken remote never delays, or breaks, the rest of the app.
 *
 * It wraps the instance returned by `initFederation`, not the global
 * `loadRemoteModule` helper (deprecated, and brittle in tests), and is
 * provided through DI so routes and tests can swap it.
 */
export class RemoteLoader {
	readonly #registrations = new Map<string, Promise<unknown>>();
	readonly #loaded = signal<ReadonlySet<string>>(new Set());

	/** Remotes downloaded in this session (shown on the dashboard). */
	readonly loaded = this.#loaded.asReadonly();

	get remotes(): readonly string[] {
		return Object.keys(this.manifest);
	}

	constructor(
		private readonly federation: Pick<
			NativeFederationResult,
			'initRemoteEntry' | 'loadRemoteModule'
		>,
		private readonly manifest: RemoteManifest,
	) {}

	async load<T>(remote: string, exposedModule: string): Promise<T> {
		await this.#register(remote);
		const module = await this.federation.loadRemoteModule<T>(
			remote,
			exposedModule,
		);
		this.#loaded.update((loaded) => new Set(loaded).add(remote));
		return module;
	}

	#register(remote: string): Promise<unknown> {
		const remoteEntry = this.manifest[remote];
		if (!remoteEntry) return Promise.reject(new UnknownRemoteError(remote));

		let registration = this.#registrations.get(remote);
		if (!registration) {
			registration = this.federation.initRemoteEntry(remoteEntry, remote);
			this.#registrations.set(remote, registration);
			// Forget failures so a later navigation can retry, e.g. after a
			// remote redeploy or a network blip.
			registration.catch(() => this.#registrations.delete(remote));
		}
		return registration;
	}
}
