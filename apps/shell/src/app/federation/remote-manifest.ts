// Imported by main.ts *before* federation is initialized, when shared packages
// such as @angular/core cannot be resolved yet. Keep this file free of
// framework imports.

/**
 * Remote name → URL of its `remoteEntry.json`.
 *
 * Loaded at runtime from `federation.manifest.json`, so each environment (local,
 * preview, production) points at different remote deployments without rebuilding
 * the shell.
 */
export type RemoteManifest = Readonly<Record<string, string>>;

export async function fetchRemoteManifest(
	url: string,
): Promise<RemoteManifest> {
	const response = await fetch(url, { cache: 'no-cache' });
	if (!response.ok) {
		throw new Error(`Could not load ${url} (${response.status})`);
	}
	const manifest: unknown = await response.json();
	const isValid =
		typeof manifest === 'object' &&
		manifest !== null &&
		Object.values(manifest).every((entry) => typeof entry === 'string');
	if (!isValid) throw new Error(`${url} must map remote names to URLs`);
	return manifest as RemoteManifest;
}
