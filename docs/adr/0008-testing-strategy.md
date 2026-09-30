# 0008. Testing strategy

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

In a micro-frontend system the riskiest code is the glue: federation, shared
state, per-app translations and failure handling. None of it is visible to a
single app's unit tests.

At the same time, each app is supposed to be owned, tested and shipped by its
own team. A test suite that can only run with every app deployed together
quietly turns them back into one release.

## Decision

**Unit and component tests: Vitest** (via Nx's AnalogJS integration, the
default for Angular 21+ in Nx 23), run per project and cached by Nx.

- Pure logic (parsers, filters, store, language resolution) is tested
  directly.
- Every page and layout component is tested through its rendered output and
  accessibility semantics (roles, live regions, accessible names), with real
  routing (`RouterTestingHarness`) and the app's real translation files, so a
  missing key fails a test.
- The federation layer (`RemoteLoader`, `loadRemoteRoutes`) is tested with a
  fake federation runtime: lazy registration, deduplication, retry after
  failure, contract violations.

**End-to-end: Playwright** against **production builds**, served like
production (`tools/scripts/serve-dist.mjs`: CORS, caching, SPA fallback).

**An e2e test lives with the app that owns the journey:**

| Suite                                | Runs against                       | Covers                                                                                      |
| ------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `apps/market/e2e` (`market-e2e`)     | the standalone market, port 4301   | catalog filters in the URL, empty and not-found states, API failure with retry, save toggle |
| `apps/wishlist/e2e` (`wishlist-e2e`) | the standalone wishlist, port 4302 | list, totals, remove with announcement, clear, links to the market                          |
| `apps/shell/e2e` (`shell-e2e`)       | the composed app, ports 4200-4202  | journeys across apps and the shell's own pages (see below)                                  |

The shell's suite covers only what needs composition: lazy loading (requests
counted per origin), cross-app state (market → shell badge → wishlist), i18n
across apps (and which origin served which translations), a remote going
down, plus the shell's own pages, skip link and focus management.

Accessibility: **axe (WCAG 2.2 A/AA) on every page**. Each app audits its own
pages; the shell's cross-app journey also audits the composed market and
wishlist pages, because some issues (duplicate ids, landmark structure) only
exist when shell and remote render together.

Shared fixtures live in `@mfe/shared-util-e2e` (tag `type:e2e-util`): clean
device per test, fail on any uncaught page error, axe, storage seeding. Only
e2e projects may import it.

**Static checks:** ESLint (with module boundaries), `tsc --noEmit` per project
(Vitest strips types without checking them), and Prettier.

## Consequences

- A remote's team runs its e2e suite without the shell or the other remote,
  and Nx runs only affected suites: a market change runs `market-e2e` and
  `shell-e2e`; a shell-only change never runs the remotes' suites.
- Remote suites use dedicated ports, so they never share a server with the
  composed suite. Each can target a deployment through its own variable
  (`E2E_MARKET_URL`, `E2E_WISHLIST_URL`, `E2E_SHELL_URL`).
- Cross-app contracts that are not typed, such as the route `/market/:id`
  linked from the wishlist, are checked in both places: the wishlist asserts
  the link it renders, and the shell asserts the link actually works.
- E2E needs builds first; Nx wires this with `dependsOn`, and caching makes
  re-runs cheap.
- Suites run one at a time (`parallelism: false`) with 2 Playwright workers
  each. Launching 4+ Chromium processes at once on Windows stalled first
  paint by about 10 s, while one browser with 4 contexts took 0.3 s. That is an
  environment limit, measured before capping.
- Visual regression testing is not included yet. It is a good addition once the
  UI stabilises.

## Alternatives considered

- **One e2e suite in the shell for everything.** Simpler to set up, but every
  remote change needs the whole system to verify, and the suite's ownership
  is unclear. That's fine for one team; it works against independent teams.
- **Remote e2e through the composed app.** It would test remotes in their real
  context, but couple each remote's pipeline to the shell and the other remote.
  The composition is already covered by the shell's cross-app journeys.
- **Jest.** Still supported, but Vitest is Nx's default for current Angular and
  runs natively on ESM.
- **E2E against dev servers.** Slower and less realistic: dev servers run
  different federation code paths than production.
