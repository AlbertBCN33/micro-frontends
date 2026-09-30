# 0002. Remotes are registered lazily from a runtime manifest

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

Requirement: a remote is downloaded only when the user visits its URL.

The NF `dynamic-host` scaffold calls
`initFederation('federation.manifest.json')`, which fetches **every** remote's
`remoteEntry.json` before the shell boots. That means:

- metadata requests to every remote at startup, whether they're used or not;
- a slow or broken remote delays, or breaks, the **whole** app's startup.

## Decision

- `main.ts` calls `initFederation({}, …)` with **no remotes**, which only sets
  up the shared dependencies. It fetches `federation.manifest.json` in parallel
  (remote name → `remoteEntry.json` URL).
- `RemoteLoader` (shell) registers a remote with `initRemoteEntry()` the first
  time one of its routes is visited, then loads `./routes`. Registrations are
  memoised, so concurrent navigations fetch once, and they are forgotten on
  failure, so the next visit retries.
- `RemoteLoader` wraps the instance returned by `initFederation()`, not the
  deprecated global `loadRemoteModule` helper, and is provided through DI.
- `loadRemoteRoutes()` turns a load failure, or a remote that breaks the
  `{ routes }` contract, into a contained "section unavailable" page inside the
  normal layout.
- The manifest is data, not code: each environment (local, preview, prod)
  points at different remote deployments **without rebuilding the shell**.

## Consequences

- Startup performs zero requests to any remote. This is covered by an e2e test
  that counts requests per origin, and it's visible on the dashboard
  ("Loaded remotes").
- First visit to a remote pays one extra round trip (`remoteEntry.json`)
  before its code. Acceptable for this app. If analytics showed it mattered,
  the next step is to prefetch on intent (hover or focus of the nav link), not
  at startup.
- The router caches a failed `loadChildren` result, so "Try again" on the
  fallback page reloads the page.
- The manifest is fetched with `cache: 'no-cache'` and must be served with
  revalidation headers, or a redeployed remote would be invisible.

## Alternatives considered

- **Scaffold default (eager `initFederation(manifest)`).** Simpler, but it
  violates the requirement and couples startup to every remote's availability.
- **Preload all remotes after first paint.** Good for perceived performance,
  but it downloads code users may never need. Easy to add later on top of
  `RemoteLoader` if data supports it.
