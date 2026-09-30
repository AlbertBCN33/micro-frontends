#!/usr/bin/env node
/**
 * Post-deploy smoke check of the live Firebase Hosting sites.
 *
 * The Hosting emulator does not apply custom headers, so firebase.json's
 * headers (CORS on remotes, caching, security) can only be verified for real.
 * This runs after every deployment and fails the run if the live setup is not
 * what the shell needs:
 * - the shell serves the SPA (including deep links) and its manifest points at
 *   the remotes' sites from .firebaserc;
 * - every remote serves remoteEntry.json and its exposed module with CORS;
 * - hashed JS/CSS is immutable; everything else is revalidated.
 *
 * Usage: node tools/scripts/verify-deploy.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const firebaserc = JSON.parse(
	readFileSync(resolve(ROOT, '.firebaserc'), 'utf8'),
);
const project = firebaserc.projects.default;
const targets = firebaserc.targets[project].hosting;
const siteUrl = (app) => `https://${targets[app][0]}.web.app`;

const failures = [];
const check = (condition, message) => {
	console.log(`${condition ? '✔' : '✖'} ${message}`);
	if (!condition) failures.push(message);
};

// Bypass any intermediate cache so the check sees the new release.
const get = (url) => fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
const header = (response, name) => response.headers.get(name) ?? '';
/** Parsed JSON, or null (reported as a failure) when the body isn't JSON. */
async function json(response, label) {
	try {
		return await response.json();
	} catch {
		check(false, `${label}: responds with JSON (${response.status})`);
		return null;
	}
}

async function checkShell() {
	const base = siteUrl('shell');
	const home = await get(`${base}/`);
	check(home.ok, `shell: ${base}/ responds (${home.status})`);
	check(
		header(home, 'cache-control').includes('no-cache'),
		'shell: index.html is revalidated (no-cache)',
	);
	check(
		header(home, 'x-frame-options') === 'DENY',
		'shell: X-Frame-Options DENY',
	);

	const deepLink = await get(`${base}/market/does-not-matter`);
	check(
		deepLink.ok && header(deepLink, 'content-type').includes('text/html'),
		'shell: deep links fall back to the SPA',
	);

	const manifest =
		(await json(
			await get(`${base}/federation.manifest.json`),
			'shell: manifest',
		)) ?? {};
	for (const remote of ['market', 'wishlist']) {
		check(
			manifest[remote] === `${siteUrl(remote)}/remoteEntry.json`,
			`shell: manifest points ${remote} at ${siteUrl(remote)}`,
		);
	}
}

async function checkRemote(remote) {
	const base = siteUrl(remote);
	const entryResponse = await get(`${base}/remoteEntry.json`);
	check(
		entryResponse.ok,
		`${remote}: remoteEntry.json responds (${entryResponse.status})`,
	);
	check(
		header(entryResponse, 'access-control-allow-origin') === '*',
		`${remote}: remoteEntry.json allows cross-origin loading`,
	);
	check(
		header(entryResponse, 'cache-control').includes('no-cache'),
		`${remote}: remoteEntry.json is revalidated (no-cache)`,
	);

	const entry = await json(entryResponse, `${remote}: remoteEntry.json`);
	const exposed = entry?.exposes?.find((e) => e.key === './routes');
	check(Boolean(exposed), `${remote}: exposes ./routes`);
	if (exposed) {
		const module = await get(`${base}/${exposed.outFileName}`);
		check(module.ok, `${remote}: ${exposed.outFileName} responds`);
		check(
			header(module, 'access-control-allow-origin') === '*',
			`${remote}: exposed module allows cross-origin loading`,
		);
		check(
			header(module, 'cache-control').includes('immutable'),
			`${remote}: hashed JS is cached as immutable`,
		);
	}
}

await checkShell();
await checkRemote('market');
await checkRemote('wishlist');

const catalog = await get(`${siteUrl('market')}/api/products.json`);
check(
	catalog.ok && header(catalog, 'access-control-allow-origin') === '*',
	'market: catalog API is reachable cross-origin',
);

if (failures.length) {
	console.error(`\n${failures.length} deployment check(s) failed.`);
	process.exit(1);
}
console.log('\nLive deployment verified.');
