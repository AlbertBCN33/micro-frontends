/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(() => ({
	root: import.meta.dirname,
	cacheDir: '../../node_modules/.vite/apps/shell',
	plugins: [angular(), tsconfigPaths()],
	test: {
		name: 'shell',
		watch: false,
		globals: true,
		environment: 'jsdom',
		include: [
			'{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
		],
		setupFiles: ['src/test-setup.ts'],
		reporters: ['default'],
		coverage: {
			reportsDirectory: '../../coverage/apps/shell',
			provider: 'v8' as const,
		},
	},
}));
