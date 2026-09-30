import readme from '../../../../../../README.md';
import {
	renderReadme,
	resolveRepoLink,
	stripExcludedSections,
} from './readme-markdown';

const BASE = 'https://github.com/org/repo/blob/main/';

describe('stripExcludedSections', () => {
	it('removes every marked section, including the markers', () => {
		const markdown = [
			'keep 1',
			'<!-- docs:exclude-start -->',
			'drop 1',
			'<!-- docs:exclude-end -->',
			'keep 2',
			'<!--docs:exclude-start-->drop 2<!--docs:exclude-end-->',
		].join('\n');

		const result = stripExcludedSections(markdown);

		expect(result).toContain('keep 1');
		expect(result).toContain('keep 2');
		expect(result).not.toMatch(/drop|docs:exclude/);
	});
});

describe('resolveRepoLink', () => {
	it.each([
		['docs/adr/README.md', `${BASE}docs/adr/README.md`],
		['.github/workflows/ci.yml', `${BASE}.github/workflows/ci.yml`],
		['https://nx.dev', 'https://nx.dev'],
		['mailto:someone@example.com', 'mailto:someone@example.com'],
		['#section', '#section'],
	])('%s → %s', (href, expected) => {
		expect(resolveRepoLink(href, BASE)).toBe(expected);
	});
});

describe('renderReadme', () => {
	it('shifts headings down one level and resolves relative links', () => {
		const html = renderReadme(
			'# Title\n\n## Section\n\nSee [ADRs](docs/adr/README.md).',
			BASE,
		);

		expect(html).toContain('<h2>Title</h2>');
		expect(html).toContain('<h3>Section</h3>');
		expect(html).toContain(`href="${BASE}docs/adr/README.md"`);
		expect(html).not.toContain('<h1');
	});

	describe('with the real project README', () => {
		const html = renderReadme(readme);

		it('leaves out the GitHub-only sections', () => {
			expect(html).not.toContain('Quick start');
			expect(html).not.toContain('npm ci');
			expect(html).not.toContain('<img');
			expect(html).not.toContain('mermaid');
			expect(html).not.toContain('docs:exclude');
		});

		it('keeps the content that explains the project', () => {
			expect(html).toContain('Decisions and tradeoffs');
			expect(html).toContain('Architecture Decision Records');
			expect(html).toContain('<table>');
		});

		it('wraps every table and code block in a keyboard-scrollable region', () => {
			const container = document.createElement('div');
			container.innerHTML = html;
			const scrollables = container.querySelectorAll('table, pre');

			expect(scrollables.length).toBeGreaterThan(0);
			for (const element of scrollables) {
				const region = element.parentElement;
				expect(region?.getAttribute('role')).toBe('region');
				expect(region?.getAttribute('tabindex')).toBe('0');
				expect(region?.getAttribute('aria-label')).toMatch(
					/^Scrollable/,
				);
			}
		});

		it('has no in-page anchors, which would navigate away in the SPA', () => {
			expect(html).not.toMatch(/href="#/);
		});

		it('never outputs a second <h1> on the page', () => {
			expect(html).not.toContain('<h1');
		});
	});
});
