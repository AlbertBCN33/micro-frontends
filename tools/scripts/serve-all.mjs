#!/usr/bin/env node
/**
 * Starts the remotes and then the shell, one after another.
 *
 * Why not `nx run-many -t serve --parallel`? Native Federation's dev builder
 * writes a shared `node_modules/.cache/native-federation/.tsbuildinfo`, and
 * starting several builders at the same moment races on it (TypeScript
 * "Debug Failure" on Windows). Waiting until each app answers before starting
 * the next removes the race and costs a few seconds. See docs/adr/0002.
 *
 * Usage: npm start            (all apps)
 *        npm start -- market  (only the listed apps, in order)
 */
import { spawn } from 'node:child_process';

const APPS = [
	{ name: 'market', port: 4201, ready: '/remoteEntry.json' },
	{ name: 'wishlist', port: 4202, ready: '/remoteEntry.json' },
	{ name: 'shell', port: 4200, ready: '/' },
];
const COLORS = { market: 36, wishlist: 35, shell: 33 };
const TIMEOUT_MS = 180_000;

const selected = process.argv.slice(2);
const apps = selected.length
	? APPS.filter((app) => selected.includes(app.name))
	: APPS;
const children = [];

function prefixed(name, stream) {
	const tag = `\x1b[${COLORS[name]}m${name.padEnd(8)}\x1b[0m│ `;
	let buffer = '';
	stream.on('data', (chunk) => {
		buffer += chunk;
		const lines = buffer.split(/\r?\n/);
		buffer = lines.pop() ?? '';
		for (const line of lines) process.stdout.write(tag + line + '\n');
	});
}

async function waitForHttp(url, child) {
	const deadline = Date.now() + TIMEOUT_MS;
	while (Date.now() < deadline) {
		if (child.exitCode !== null) throw new Error(`${url}: process exited`);
		try {
			const response = await fetch(url);
			if (response.ok) return;
		} catch {
			// Not listening yet.
		}
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
	throw new Error(`Timed out waiting for ${url}`);
}

function stopAll(code = 0) {
	for (const child of children) {
		if (child.exitCode === null) {
			// On Windows the dev server runs in a child of the shell; kill the tree.
			if (process.platform === 'win32') {
				spawn('taskkill', ['/pid', String(child.pid), '/T', '/F']);
			} else {
				child.kill('SIGTERM');
			}
		}
	}
	process.exit(code);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));

for (const app of apps) {
	const child = spawn(
		'npx',
		['nx', 'serve', app.name, '--outputStyle=stream'],
		{
			shell: true,
			env: { ...process.env, FORCE_COLOR: '1' },
		},
	);
	children.push(child);
	prefixed(app.name, child.stdout);
	prefixed(app.name, child.stderr);

	try {
		await waitForHttp(`http://localhost:${app.port}${app.ready}`, child);
		console.log(
			`\x1b[32m✔ ${app.name} ready on http://localhost:${app.port}\x1b[0m`,
		);
	} catch (error) {
		console.error(`\x1b[31m✖ ${app.name}: ${error.message}\x1b[0m`);
		stopAll(1);
	}
}
