import nx from '@nx/eslint-plugin';
import baseConfig from '../../../eslint.config.mjs';

export default [
	...nx.configs['flat/angular'],
	...nx.configs['flat/angular-template'],
	...baseConfig,
	{
		files: ['**/*.json'],
		rules: {
			'@nx/dependency-checks': [
				'error',
				{
					ignoredFiles: [
						'{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
						// Test tooling is not a runtime dependency of the published package.
						'{projectRoot}/vite.config.{js,ts,mjs,mts}',
						'{projectRoot}/src/test-setup.ts',
						'{projectRoot}/**/*.spec.ts',
					],
				},
			],
		},
		languageOptions: {
			parser: await import('jsonc-eslint-parser'),
		},
	},
	{
		files: ['**/*.ts'],
		rules: {
			// Templates and styles live in their own files (templateUrl/styleUrl).
			'@angular-eslint/component-max-inline-declarations': [
				'error',
				{ template: 0, styles: 0, animations: 0 },
			],
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'wl',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'wl',
					style: 'kebab-case',
				},
			],
		},
	},
	{
		files: ['**/*.html'],
		// Override or add rules here
		rules: {},
	},
	{
		// Inline test-host components are idiomatic in specs.
		files: ['**/*.spec.ts'],
		rules: {
			'@angular-eslint/component-max-inline-declarations': 'off',
		},
	},
];
