#!/usr/bin/env node
/**
 * Checks every app's translation files:
 * - all languages define exactly the same keys (no missing or stale strings);
 * - every message is valid ICU MessageFormat for its language.
 *
 * Runs in CI (`npm run i18n:check`); exits non-zero with a readable report.
 */
import MessageFormat from '@messageformat/core';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const APPS_DIR = resolve(import.meta.dirname, '../../apps');
const errors = [];

function flatten(object, prefix = '') {
	return Object.entries(object).flatMap(([key, value]) =>
		typeof value === 'object' && value !== null
			? flatten(value, `${prefix}${key}.`)
			: [[`${prefix}${key}`, value]],
	);
}

for (const app of readdirSync(APPS_DIR)) {
	const dir = join(APPS_DIR, app, 'src', 'i18n');
	if (!existsSync(dir)) continue;

	const files = readdirSync(dir).filter((file) => file.endsWith('.json'));
	const catalogs = Object.fromEntries(
		files.map((file) => [
			file.replace('.json', ''),
			new Map(flatten(JSON.parse(readFileSync(join(dir, file), 'utf8')))),
		]),
	);

	const allKeys = new Set(
		Object.values(catalogs).flatMap((catalog) => [...catalog.keys()]),
	);
	for (const [lang, catalog] of Object.entries(catalogs)) {
		for (const key of allKeys) {
			if (!catalog.has(key))
				errors.push(`${app}/${lang}: missing "${key}"`);
		}
		const mf = new MessageFormat(lang);
		for (const [key, message] of catalog) {
			try {
				mf.compile(String(message));
			} catch (error) {
				errors.push(
					`${app}/${lang}: invalid ICU in "${key}": ${error.message}`,
				);
			}
		}
	}
	console.log(
		`✔ ${app}: ${allKeys.size} keys × ${Object.keys(catalogs).join(', ')}`,
	);
}

if (errors.length) {
	console.error(`\n✖ ${errors.length} translation problem(s):`);
	for (const error of errors) console.error(`  - ${error}`);
	process.exit(1);
}
