# 0006. Client-side rendering only (no SSR)

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

The original workspace had SSR (Express `server.ts`, `serve-ssr`,
`prerender`) on every app. The deploy target is Firebase Hosting, which serves
static files. SSR combined with federation requires a Node runtime per
deployment and federation-aware server bundles.

## Decision

All apps are client-side rendered SPAs, served as static files.

## Consequences

- Deployment is three static folders plus headers (CORS on remotes, caching
  rules, SPA fallback). `tools/scripts/serve-dist.mjs` reproduces this setup
  locally, and it doubles as the e2e server.
- The initial shell payload is about 40 kB transferred. Angular itself arrives
  as shared, long-cacheable bundles.
- No server-rendered first paint or SEO for product pages. For a real store
  that is a real cost. The mitigation path is NF's SSR support plus Firebase
  App Hosting, or prerendering the catalog, which is data that rarely changes.

## Alternatives considered

- **Keep SSR.** More moving parts (a server per app, hydration across
  federation boundaries) for a demo whose value is in the client architecture.
- **Prerender the shell only.** Little benefit: the shell's content is mostly
  navigation.
