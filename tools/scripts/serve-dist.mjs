#!/usr/bin/env node
/**
 * Serves the production builds of all apps on their usual ports, the way a
 * static host (Firebase Hosting) will:
 * - SPA fallback to index.html for unknown paths;
 * - CORS on the remotes, because the shell (another origin) loads their
 *   modules, translations and catalog data;
 * - long-lived caching only for the bundler's content-hashed JS/CSS; everything
 *   else (index.html, remoteEntry.json, the manifest, catalog data, images)
 *   keeps a stable name, so it must be revalidated.
 *
 * Used by the e2e suite and `npm run serve:dist`. Zero dependencies on purpose.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../../dist/apps');
const APPS = [
	{ name: 'shell', port: 4200 },
	{ name: 'market', port: 4201 },
	{ name: 'wishlist', port: 4202 },
];
const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.map': 'application/json; charset=utf-8',
	'.txt': 'text/plain; charset=utf-8',
};
const IMMUTABLE = new Set(['.js', '.css']);

for (const { name, port } of APPS) {
	const base = join(ROOT, name, 'browser');
	if (!existsSync(base)) {
		console.error(`Missing ${base}. Run: npx nx run-many -t build`);
		process.exit(1);
	}

	createServer((req, res) => {
		const url = new URL(req.url ?? '/', `http://localhost:${port}`);
		let file = normalize(join(base, decodeURIComponent(url.pathname)));
		if (!file.startsWith(base)) {
			res.writeHead(403).end();
			return;
		}
		if (!existsSync(file) || statSync(file).isDirectory()) {
			file = join(base, 'index.html');
		}

		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader(
			'Content-Type',
			TYPES[extname(file)] ?? 'application/octet-stream',
		);
		res.setHeader(
			'Cache-Control',
			IMMUTABLE.has(extname(file))
				? 'public, max-age=31536000, immutable'
				: 'no-cache',
		);
		createReadStream(file).pipe(res);
	}).listen(port, () =>
		console.log(`${name.padEnd(8)} http://localhost:${port}`),
	);
}
