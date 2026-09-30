# 0005. No backend: static catalog behind a typed seam

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

The goal is to demonstrate frontend architecture. A custom API adds scope,
hosting cost (Firebase Functions requires the paid plan) and a second thing to
keep running for a portfolio demo.

## Decision

- The market serves its catalog as a static file it owns:
  `apps/market/public/api/products.json`.
- Endpoints are `InjectionToken`s (`PRODUCTS_URL`, `MARKET_BASE_URL`), resolved
  against the market's own origin via `import.meta.url`, because a relative URL
  would hit the shell when composed.
- The payload is validated at the boundary (`parseProducts`). An unexpected
  shape becomes the UI's error state instead of `undefined` in templates.
- Data is fetched with Angular's `httpResource` (stable in v22), provided on
  the market's route subtree, so list and detail share one request.
- Wishlist persistence sits behind the `WishlistStorage` port (see
  [0003](0003-cross-app-state-contract.md)).

Moving to a real API means changing `PRODUCTS_URL` and, if the wire format
differs, the parser. No component changes.

## Consequences

- The demo cannot go down because of a backend, and e2e tests are
  deterministic.
- Error, loading and retry paths are still exercised: in unit tests with
  `HttpTestingController`, and in e2e by intercepting the request with
  Playwright's `page.route` (500 → error → retry).
- Search and filtering run on the client. That is right for 18 products; with
  thousands, they would move server-side behind the same URL-driven filter
  state.

## Alternatives considered

- **MSW (Mock Service Worker).** This was the initial plan. It was dropped once
  the static file plus Playwright interception covered every scenario MSW
  would have. A service worker is registered per _origin_, which would need a
  separate setup for composed vs standalone mode for no additional coverage.
  Worth reconsidering if a real API with complex behaviour (pagination, auth)
  appears.
- **An Nx Node/NestJS BFF in the monorepo.** It would show shared types
  front-to-back, but costs scope and hosting. It is the natural next step,
  behind the same tokens.
