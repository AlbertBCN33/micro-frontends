# 0009. One Hosting site per app, affected-only continuous deployment

- **Status:** Accepted
- **Date:** 2026-09-30

## Context

The apps are static builds ([0006](0006-client-side-rendering.md)) and must
deploy independently, or the micro-frontend split buys nothing. The target is
Firebase Hosting on the free Spark plan.

## Decision

- **One Firebase project, one Hosting site per app** (`firebase.json` hosting
  targets). Site IDs live only in `.firebaserc`.
- **Headers per site:** remotes send `Access-Control-Allow-Origin: *`, because
  the shell loads their modules, translations and catalog from another origin.
  Only content-hashed JS/CSS is cached as immutable; everything else
  (`index.html`, `remoteEntry.json`, the manifest, data, images) is revalidated,
  so a new release is visible immediately. The shell adds basic security
  headers.
- **The production manifest is written at deploy time** from `.firebaserc` into
  the built shell. The shell is built once, and the environment is decided by
  data ([0002](0002-lazy-remotes-runtime-manifest.md)).
- **Continuous deployment in the CI workflow:** a `deploy` job that runs only
  after the CI job passes on `main`. It deploys only the affected apps, remotes
  before the shell, then **verifies the live sites** (CORS, caching, manifest,
  SPA fallback).
- The Firebase CLI runs through `npx` at a pinned version, instead of being a
  dev dependency that every CI install would download (~250 MB).

## Consequences

- A market-only change redeploys only the market; the shell and wishlist are
  untouched.
- `CORS: *` is acceptable because every file is public and no request carries
  credentials. If that ever changes, it becomes an allow-list of shell origins.
- The Hosting emulator does not apply custom headers, so header rules are
  checked against the live sites after each deployment instead of locally.
- Deploys cannot be cancelled halfway: runs on `main` queue.
- A change to `firebase.json` itself is not tied to an app, so it needs a manual
  "deploy all" run.

## Alternatives considered

- **One site with path prefixes (`/`, `/market-app/`, `/wishlist-app/`).** No
  CORS, but one release for all apps, which defeats independent deployment.
- **Firebase's generated GitHub workflow.** It deploys everything on every
  merge and knows nothing about Nx's affected graph or deployment order.
- **Firebase App Hosting / Cloud Run.** Needed for SSR, which this app does not
  use; it also requires the paid Blaze plan.
