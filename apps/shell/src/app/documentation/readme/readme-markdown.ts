import { Marked, Token } from 'marked';

export const REPO_BLOB_URL =
	'https://github.com/AlbertBCN33/micro-frontends/blob/main/';

/**
 * Sections wrapped in these comments are for GitHub only (badge, table of
 * contents, screenshots, setup). The comments are invisible on GitHub.
 */
const EXCLUDED_SECTIONS =
	/<!--\s*docs:exclude-start\s*-->[\s\S]*?<!--\s*docs:exclude-end\s*-->/g;

export function stripExcludedSections(markdown: string): string {
	return markdown.replace(EXCLUDED_SECTIONS, '');
}

/** Relative repo links (docs/adr/…, .github/…) point to GitHub in the app. */
export function resolveRepoLink(href: string, base = REPO_BLOB_URL): string {
	const isAbsolute =
		/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//');
	return isAbsolute || href.startsWith('#') ? href : new URL(href, base).href;
}

/**
 * Wide tables and code blocks scroll horizontally on small screens. A
 * scrollable region must be reachable by keyboard (WCAG 2.1.1; axe rule
 * scrollable-region-focusable), so each one is wrapped in a focusable,
 * labelled region.
 */
function wrapScrollable(html: string): string {
	const open = (label: string) =>
		`<div class="scroll-region" role="region" tabindex="0" aria-label="${label}">`;
	return html
		.replace(/<table>/g, `${open('Scrollable table')}<table>`)
		.replaceAll('</table>', '</table></div>')
		.replace(/<pre>/g, `${open('Scrollable code block')}<pre>`)
		.replaceAll('</pre>', '</pre></div>');
}

/**
 * Renders the project README for the documentation page:
 * - drops GitHub-only sections;
 * - shifts headings one level down, because the page already has its <h1>;
 * - resolves relative links against the repository on GitHub;
 * - makes wide tables and code blocks keyboard-scrollable.
 *
 * The output still goes through Angular's HTML sanitizer when bound with
 * [innerHTML]; the README is our own, build-time content.
 */
export function renderReadme(markdown: string, base = REPO_BLOB_URL): string {
	const marked = new Marked({
		gfm: true,
		async: false,
		walkTokens(token: Token) {
			if (token.type === 'heading') {
				token.depth = Math.min(token.depth + 1, 6);
			}
			if (token.type === 'link' || token.type === 'image') {
				token.href = resolveRepoLink(token.href, base);
			}
		},
	});
	return wrapScrollable(
		marked.parse(stripExcludedSections(markdown)) as string,
	);
}
