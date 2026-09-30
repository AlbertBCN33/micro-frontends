import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
	...nx.configs['flat/angular'],
	...nx.configs['flat/angular-template'],
	...baseConfig,
	{
		// Nested e2e project: linted by its own config (apps/shell/e2e).
		// Nx runs ESLint from the workspace root, so match from any depth.
		ignores: ['**/e2e/**'],
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
					prefix: 'shell',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'shell',
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
