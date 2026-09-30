# 0008. Testing strategy

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

In a micro-frontend system the riskiest code is the glue: federation, shared
state, per-app translations and failure handling. None of it is visible to a
single app's unit tests.

## Decision

**Unit and component tests: Vitest** (via Nx's AnalogJS integration, the
default for Angular 21+ in Nx 23), run per project and cached by Nx.

- Pure logic (parsers, filters, store, language resolution) is tested
  directly.
- Components are tested through their rendered output and accessibility
  semantics (roles, live regions, accessible names), not their internals.
- The federation layer (`RemoteLoader`, `loadRemoteRoutes`) is tested with a
  fake federation runtime: lazy registration, deduplication, retry after
  failure, contract violations.

**End-to-end: Playwright** against the **production builds**, served like
production (`tools/scripts/serve-dist.mjs`: CORS, caching, SPA fallback). The
e2e suite covers what only the composed app can show:

- lazy loading (request counts per origin);
- cross-app state (market → shell badge → wishlist);
- i18n across apps (and which origin served which translations);
- resilience (an unreachable remote, a failing API with retry);
- accessibility: **axe (WCAG 2.2 A/AA) on every page**, plus keyboard skip link
  and focus management.

Every e2e test fails on any uncaught page error (fixture teardown check).

**Static checks:** ESLint (with module boundaries), `tsc --noEmit` per project
(Vitest strips types without checking them), and Prettier.

## Consequences

- E2E needs builds first; Nx wires this with `dependsOn`, and caching makes
  re-runs cheap.
- Playwright workers are capped at 2. Launching 4+ Chromium processes at once on
  Windows stalled first paint by about 10 s, while one browser with 4 contexts
  took 0.3 s. That is an environment limit, measured before capping.
- Visual regression testing is not included yet. It is a good addition once the
  UI stabilises.

## Alternatives considered

- **Jest.** Still supported, but Vitest is Nx's default for current Angular and
  runs natively on ESM.
- **E2E against dev servers.** Slower and less realistic: dev servers run
  different federation code paths than production.
