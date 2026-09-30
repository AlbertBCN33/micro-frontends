import nx from '@nx/eslint-plugin';

export default [
	...nx.configs['flat/base'],
	...nx.configs['flat/typescript'],
	...nx.configs['flat/javascript'],
	{
		ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*'],
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {
			'@nx/enforce-module-boundaries': [
				'error',
				{
					enforceBuildableLibDependency: true,
					allow: [
						'^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
						// The shell's documentation page renders the repository README
						// (bundled as text). Only the root README.md is allowed.
						'^(\\.\\./)+README\\.md$',
					],
					// The architecture, enforced. Remotes never import each other
					// (they meet only at runtime through the shell) and depend
					// on shared libraries through narrow, layered types.
					depConstraints: [
						{
							sourceTag: 'type:app',
							onlyDependOnLibsWithTags: [
								'type:ui',
								'type:data-access',
								'type:util',
							],
						},
						{
							sourceTag: 'type:ui',
							onlyDependOnLibsWithTags: ['type:ui', 'type:util'],
						},
						{
							sourceTag: 'type:data-access',
							onlyDependOnLibsWithTags: [
								'type:data-access',
								'type:util',
							],
						},
						{
							sourceTag: 'type:util',
							onlyDependOnLibsWithTags: ['type:util'],
						},
						{
							// e2e suites use shared fixtures only; they test apps
							// through the browser, never by importing them.
							sourceTag: 'type:e2e',
							onlyDependOnLibsWithTags: ['type:e2e-util'],
						},
						{
							sourceTag: 'type:e2e-util',
							onlyDependOnLibsWithTags: ['type:e2e-util'],
						},
						{
							sourceTag: 'scope:shell',
							onlyDependOnLibsWithTags: [
								'scope:shell',
								'scope:shared',
							],
						},
						{
							sourceTag: 'scope:market',
							onlyDependOnLibsWithTags: [
								'scope:market',
								'scope:shared',
							],
						},
						{
							sourceTag: 'scope:wishlist',
							onlyDependOnLibsWithTags: [
								'scope:wishlist',
								'scope:shared',
							],
						},
						{
							sourceTag: 'scope:shared',
							onlyDependOnLibsWithTags: ['scope:shared'],
						},
					],
				},
			],
		},
	},
	{
		files: [
			'**/*.ts',
			'**/*.tsx',
			'**/*.cts',
			'**/*.mts',
			'**/*.js',
			'**/*.jsx',
			'**/*.cjs',
			'**/*.mjs',
		],
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],
		},
	},
	{
		// These files run before Native Federation has built the import map,
		// when shared packages (Angular, RxJS, @mfe/*) cannot be resolved yet.
		// Importing one here breaks the app at startup, silently in unit tests.
		files: [
			'apps/shell/src/main.ts',
			'apps/shell/src/app/federation/remote-manifest.ts',
		],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: [
								'@angular/*',
								'@mfe/*',
								'@ngx-translate/*',
								'rxjs',
								'rxjs/*',
							],
							message:
								'Not resolvable before initFederation(). Import it from bootstrap.ts instead.',
						},
					],
				},
			],
		},
	},
	{
		// In tests a null simply fails the test; guarding each query adds noise.
		files: ['**/*.spec.ts'],
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
		},
	},
];
