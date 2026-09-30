import { expect, test as base } from '@mfe/shared-util-e2e';

const REMOTE_ORIGINS = {
	market: /^http:\/\/localhost:4201\//,
	wishlist: /^http:\/\/localhost:4202\//,
} as const;

type Remote = keyof typeof REMOTE_ORIGINS;

/**
 * Shell-only fixture on top of the shared ones: which remote origins the
 * composed app has contacted (lazy-loading assertions).
 */
export const test = base.extend<{
	remoteRequests: Record<Remote, string[]>;
}>({
	remoteRequests: async ({ page }, use) => {
		const seen: Record<Remote, string[]> = { market: [], wishlist: [] };
		page.on('request', (request) => {
			for (const remote of Object.keys(REMOTE_ORIGINS) as Remote[]) {
				if (REMOTE_ORIGINS[remote].test(request.url())) {
					seen[remote].push(request.url());
				}
			}
		});
		await use(seen);
	},
});

export { expect };
