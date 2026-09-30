#!/usr/bin/env node
/**
 * Writes the production federation.manifest.json into the built shell
 * (dist/apps/shell/browser), pointing each remote at its Firebase Hosting site.
 *
 * The site IDs come from .firebaserc (hosting targets), so where a remote is
 * deployed and where the shell looks for it can't drift apart. The shell is
 * not rebuilt for this: the manifest is read at runtime (docs/adr/0002).
 *
 * Usage: node tools/scripts/write-manifest.mjs [--check]
 *   --check  print the manifest without writing it
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../..');
const REMOTES = ['market', 'wishlist'];

const firebaserc = JSON.parse(
	readFileSync(resolve(ROOT, '.firebaserc'), 'utf8'),
);
const project = firebaserc.projects.default;
const targets = firebaserc.targets?.[project]?.hosting ?? {};

const manifest = Object.fromEntries(
	REMOTES.map((remote) => {
		const site = targets[remote]?.[0];
		if (!site) {
			console.error(`No hosting target "${remote}" in .firebaserc`);
			process.exit(1);
		}
		return [remote, `https://${site}.web.app/remoteEntry.json`];
	}),
);
const json = JSON.stringify(manifest, null, '\t') + '\n';

if (process.argv.includes('--check')) {
	process.stdout.write(json);
	process.exit(0);
}

const out = resolve(ROOT, 'dist/apps/shell/browser/federation.manifest.json');
if (!existsSync(out)) {
	console.error(`Missing ${out}. Build the shell first: npx nx build shell`);
	process.exit(1);
}
writeFileSync(out, json);
console.log(`[write-manifest] ${out}\n${json}`);
